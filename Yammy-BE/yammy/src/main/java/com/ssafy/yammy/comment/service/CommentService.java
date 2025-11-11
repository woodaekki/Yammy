package com.ssafy.yammy.comment.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.comment.dto.CommentListResponse;
import com.ssafy.yammy.comment.dto.CommentRequest;
import com.ssafy.yammy.comment.dto.CommentResponse;
import com.ssafy.yammy.comment.entity.Comment;
import com.ssafy.yammy.comment.repository.CommentLikeRepository;
import com.ssafy.yammy.comment.repository.CommentRepository;
import com.ssafy.yammy.global.util.BadWordsFilterUtil;
import com.ssafy.yammy.post.entity.Post;
import com.ssafy.yammy.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final BadWordsFilterUtil badWordsFilterUtil;

    private static final int DEFAULT_PAGE_SIZE = 50;

    // 댓글 작성
    @Transactional
    public CommentResponse createComment(Long postId, Long memberId, CommentRequest request) {
        // 게시글 존재 확인
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        // 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));

        String cleanContent = badWordsFilterUtil.maskBadWords(request.getContent());

        // 댓글 저장
        Comment comment = Comment.builder()
                .postId(postId)
                .memberId(memberId)
                .content(cleanContent)
                .build();
        Comment savedComment = commentRepository.save(comment);

        // 게시글의 댓글 수 증가
        post.incrementCommentCount();
        postRepository.save(post);

        return buildCommentResponse(savedComment, member, false);
    }

    // 댓글 조회 (커서 기반 페이징)
    @Transactional(readOnly = true)
    public CommentListResponse getComments(Long postId, Long cursor, Long memberId) {
        PageRequest pageRequest = PageRequest.of(0, DEFAULT_PAGE_SIZE + 1);
        List<Comment> comments = commentRepository.findByPostIdWithCursor(postId, cursor, pageRequest);

        boolean hasNext = comments.size() > DEFAULT_PAGE_SIZE;
        if (hasNext) {
            comments = comments.subList(0, DEFAULT_PAGE_SIZE);
        }

        // 댓글 ID 목록 추출
        List<Long> commentIds = comments.stream()
                .map(Comment::getId)
                .collect(Collectors.toList());

        // 좋아요 여부 배치 조회
        Set<Long> likedCommentIds = memberId != null
                ? new HashSet<>(commentLikeRepository.findLikedCommentIdsByMemberIdAndCommentIds(commentIds, memberId))
                : new HashSet<>();

        // 작성자 정보 배치 조회
        List<Long> memberIds = comments.stream()
                .map(Comment::getMemberId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Member> memberMap = memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getMemberId, m -> m));

        // CommentResponse 리스트 생성
        List<CommentResponse> commentResponses = comments.stream()
                .map(comment -> {
                    Member member = memberMap.get(comment.getMemberId());
                    boolean isLiked = likedCommentIds.contains(comment.getId());
                    return buildCommentResponse(comment, member, isLiked);
                })
                .collect(Collectors.toList());

        Long nextCursor = hasNext && !comments.isEmpty() ? comments.get(comments.size() - 1).getId() : null;

        return CommentListResponse.builder()
                .comments(commentResponses)
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .build();
    }

    // 댓글 수정
    @Transactional
    public CommentResponse updateComment(Long commentId, Long memberId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));

        // 작성자 확인
        if (!comment.getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "댓글을 수정할 권한이 없습니다.");
        }

        String cleanContent = badWordsFilterUtil.maskBadWords(request.getContent());

        comment.updateContent(cleanContent);
        Comment updatedComment = commentRepository.save(comment);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "작성자를 찾을 수 없습니다."));

        boolean isLiked = commentLikeRepository.existsByCommentIdAndMemberId(commentId, memberId);

        return buildCommentResponse(updatedComment, member, isLiked);
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, Long memberId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));

        // 작성자 확인
        if (!comment.getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "댓글을 삭제할 권한이 없습니다.");
        }

        // 게시글의 댓글 수 감소
        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        post.decrementCommentCount();
        postRepository.save(post);

        // 댓글 삭제
        commentRepository.delete(comment);
    }

    // CommentResponse 빌드 헬퍼 메서드
    private CommentResponse buildCommentResponse(Comment comment, Member member, boolean isLiked) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .profileImage(member.getProfileImage())
                .team(member.getTeam())
                .content(comment.getContent())
                .likeCount(comment.getLikeCount())
                .isLiked(isLiked)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
