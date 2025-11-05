package com.ssafy.yammy.chatgames.repository;

import com.ssafy.yammy.chatgames.entity.ChatRoom;
import com.ssafy.yammy.chatgames.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByRoomKey(String roomKey);
    List<ChatRoom> findByStatus(RoomStatus status);
}