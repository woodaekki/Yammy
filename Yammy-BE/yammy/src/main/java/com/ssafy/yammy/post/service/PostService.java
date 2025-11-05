package com.ssafy.yammy.post.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.follow.repository.FollowRepository;
import com.ssafy.yammy.post.dto.*;
import com.ssafy.yammy.post.entity.Post;
import com.ssafy.yammy.post.entity.PostImage;
import com.ssafy.yammy.post.repository.PostImageRepository;
import com.ssafy.yammy.post.repository.PostLikeRepository;
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
public class PostService {

    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final PostLikeRepository postLikeRepository;
    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;

    private static final int DEFAULT_PAGE_SIZE = 20;

    // 게시글 작성
    @Transactional
    public PostResponse createPost(Long memberId, PostCreateRequest request) {
        // 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));

        // 이미지 검증 (1~3장)
        if (request.getImageUrls() == null || request.getImageUrls().isEmpty()) {
            throw new IllegalArgumentException("게시글에는 최소 1개의 이미지가 필요합니다.");
        }
        if (request.getImageUrls().size() > 3) {
            throw new IllegalArgumentException("게시글에는 최대 3개의 이미지만 업로드할 수 있습니다.");
        }

        // 게시글 저장
        Post post = Post.builder()
                .memberId(memberId)
                .caption(request.getCaption())
                .build();
        Post savedPost = postRepository.save(post);

        // 이미지 저장
        List<PostImage> postImages = new ArrayList<>();
        for (int i = 0; i < request.getImageUrls().size(); i++) {
            PostImage postImage = PostImage.builder()
                    .postId(savedPost.getId())
                    .imageUrl(request.getImageUrls().get(i))
                    .imageOrder(i + 1)
                    .build();
            postImages.add(postImageRepository.save(postImage));
        }

        // Response 생성
        return buildPostResponse(savedPost, member, postImages, false);
    }

    // 게시글 상세 조회
    @Transactional(readOnly = true)
    public PostResponse getPost(Long postId, Long memberId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        Member member = memberRepository.findById(post.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "작성자를 찾을 수 없습니다."));

        List<PostImage> postImages = postImageRepository.findByPostIdOrderByImageOrder(postId);

        boolean isLiked = memberId != null && postLikeRepository.existsByPostIdAndMemberId(postId, memberId);

        return buildPostResponse(post, member, postImages, isLiked);
    }

    // 전체 피드 조회 (커서 기반 페이징)
    @Transactional(readOnly = true)
    public PostListResponse getAllPosts(Long cursor, Long memberId) {
        PageRequest pageRequest = PageRequest.of(0, DEFAULT_PAGE_SIZE + 1);
        List<Post> posts = postRepository.findAllWithCursor(cursor, pageRequest);

        return buildPostListResponse(posts, memberId);
    }

    // 내 피드 조회 (나 + 팔로우한 사람들)
    @Transactional(readOnly = true)
    public PostListResponse getMyFeed(Long cursor, Long memberId) {
        // 내가 팔로우한 사람들의 ID 목록 가져오기
        List<Long> followingIds = followRepository.findByFollowerId(memberId, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .map(follow -> follow.getFollowingId())
                .collect(Collectors.toList());

        // 내 ID도 포함
        followingIds.add(memberId);

        PageRequest pageRequest = PageRequest.of(0, DEFAULT_PAGE_SIZE + 1);
        List<Post> posts = postRepository.findByMemberIdsWithCursor(followingIds, cursor, pageRequest);

        return buildPostListResponse(posts, memberId);
    }

    // 특정 사용자의 게시글 조회 (프로필 페이지용)
    @Transactional(readOnly = true)
    public PostListResponse getUserPosts(Long userId, Long cursor, Long currentMemberId) {
        PageRequest pageRequest = PageRequest.of(0, DEFAULT_PAGE_SIZE + 1);
        List<Post> posts = postRepository.findByMemberIdWithCursor(userId, cursor, pageRequest);

        return buildPostListResponse(posts, currentMemberId);
    }

    // 게시글 수정 (캡션만)
    @Transactional
    public PostResponse updatePost(Long postId, Long memberId, PostUpdateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        // 작성자 확인
        if (!post.getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "게시글을 수정할 권한이 없습니다.");
        }

        post.updateCaption(request.getCaption());
        Post updatedPost = postRepository.save(post);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "작성자를 찾을 수 없습니다."));

        List<PostImage> postImages = postImageRepository.findByPostIdOrderByImageOrder(postId);
        boolean isLiked = postLikeRepository.existsByPostIdAndMemberId(postId, memberId);

        return buildPostResponse(updatedPost, member, postImages, isLiked);
    }

    // 게시글 삭제
    @Transactional
    public void deletePost(Long postId, Long memberId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        // 작성자 확인
        if (!post.getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "게시글을 삭제할 권한이 없습니다.");
        }

        // 이미지 먼저 삭제
        postImageRepository.deleteByPostId(postId);

        // 게시글 삭제
        postRepository.delete(post);
    }

    // PostResponse 빌드 헬퍼 메서드
    private PostResponse buildPostResponse(Post post, Member member, List<PostImage> postImages, boolean isLiked) {
        List<String> imageUrls = postImages.stream()
                .map(PostImage::getImageUrl)
                .collect(Collectors.toList());

        return PostResponse.builder()
                .id(post.getId())
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .profileImage(member.getProfileImage())
                .team(member.getTeam())
                .caption(post.getCaption())
                .imageUrls(imageUrls)
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .isLiked(isLiked)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    // PostListResponse 빌드 헬퍼 메서드
    private PostListResponse buildPostListResponse(List<Post> posts, Long memberId) {
        boolean hasNext = posts.size() > DEFAULT_PAGE_SIZE;
        if (hasNext) {
            posts = posts.subList(0, DEFAULT_PAGE_SIZE);
        }

        // 게시글 ID 목록 추출
        List<Long> postIds = posts.stream()
                .map(Post::getId)
                .collect(Collectors.toList());

        // 이미지 배치 조회
        Map<Long, List<PostImage>> postImagesMap = postImageRepository.findByPostIdIn(postIds).stream()
                .collect(Collectors.groupingBy(PostImage::getPostId));

        // 좋아요 여부 배치 조회
        Set<Long> likedPostIds = memberId != null
                ? new HashSet<>(postLikeRepository.findLikedPostIdsByMemberIdAndPostIds(postIds, memberId))
                : new HashSet<>();

        // 작성자 정보 배치 조회
        List<Long> memberIds = posts.stream()
                .map(Post::getMemberId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Member> memberMap = memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getMemberId, m -> m));

        // PostResponse 리스트 생성
        List<PostResponse> postResponses = posts.stream()
                .map(post -> {
                    Member member = memberMap.get(post.getMemberId());
                    List<PostImage> postImages = postImagesMap.getOrDefault(post.getId(), Collections.emptyList());
                    boolean isLiked = likedPostIds.contains(post.getId());

                    return buildPostResponse(post, member, postImages, isLiked);
                })
                .collect(Collectors.toList());

        Long nextCursor = hasNext && !posts.isEmpty() ? posts.get(posts.size() - 1).getId() : null;

        return PostListResponse.builder()
                .posts(postResponses)
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .build();
    }
}
