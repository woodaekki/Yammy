-- 배팅 테이블 생성 SQL
CREATE TABLE betting (
    betting_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    match_id BIGINT NOT NULL,
    selected_team INT NOT NULL COMMENT '0: 홈팀, 1: 원정팀',
    bet_amount BIGINT NOT NULL COMMENT '배팅 금액',
    odds DOUBLE NOT NULL COMMENT '배당률',
    expected_return BIGINT NOT NULL COMMENT '예상 수익',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '배팅 상태 (PENDING, WIN, LOSE, CANCELLED)',
    actual_return BIGINT COMMENT '실제 수익',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (match_id) REFERENCES match_schedule(id),
    
    INDEX idx_member_id (member_id),
    INDEX idx_match_id (match_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT = '배팅 정보 테이블';

-- 배팅 상태에 대한 체크 제약 조건 추가
ALTER TABLE betting 
ADD CONSTRAINT chk_betting_status 
CHECK (status IN ('PENDING', 'WIN', 'LOSE', 'CANCELLED'));

-- 선택된 팀에 대한 체크 제약 조건 추가  
ALTER TABLE betting 
ADD CONSTRAINT chk_selected_team 
CHECK (selected_team IN (0, 1));

-- 금액 관련 체크 제약 조건 추가
ALTER TABLE betting 
ADD CONSTRAINT chk_bet_amount 
CHECK (bet_amount > 0);

ALTER TABLE betting 
ADD CONSTRAINT chk_expected_return 
CHECK (expected_return >= 0);

ALTER TABLE betting 
ADD CONSTRAINT chk_actual_return 
CHECK (actual_return >= 0);
