package com.ssafy.yammy.payment.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.repository.UsedItemRepository;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
@Getter
@Setter
public class UsedItemController {

    private final UsedItemRepository usedItemRepository;

    // 중고 거래 목록 전체 조회
    @GetMapping("/trades")
    public ResponseEntity<List<UsedItem>> getAllTrades() {
        List<UsedItem> items = usedItemRepository.findAll();
        return ResponseEntity.ok(items);
    }

    // 중고 거래 목록 단건 조회
    @GetMapping("/trades/{id}")
    public ResponseEntity<UsedItem> getTrade(@PathVariable long id) {
        UsedItem item = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(item);
    }

    // 중고 거래 목록 게시물 작성 (보안 처리는 추후)
    @PostMapping("/trades")
    public ResponseEntity<UsedItem> createTrade(@RequestBody UsedItem usedItem) {
        UsedItem savedItem = usedItemRepository.save(usedItem);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedItem); // json의 바디 형태 반환
    }

    @PutMapping("/trades/{id}")
    public ResponseEntity<UsedItem> updateTrade(@PathVariable long id, @RequestBody UsedItem usedItem) {
        Optional<UsedItem> fixedItem = usedItemRepository.findById(id);

        UsedItem useditem = fixedItem.get();
        useditem.setTitle(usedItem.getTitle());
        useditem.setDescription(usedItem.getDescription());
        useditem.setPrice(usedItem.getPrice());
        useditem.setStatus(usedItem.isStatus());

        UsedItem savedItem = usedItemRepository.save(useditem);
        return ResponseEntity.ok(savedItem);
    }


    @DeleteMapping("/trades/{id}")
    public ResponseEntity<String> deleteTrade(@PathVariable long id) {
        usedItemRepository.deleteById(id);
        return ResponseEntity.ok("성공적으로 삭제되었습니다.");
    }


}
