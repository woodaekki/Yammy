package com.ssafy.yammy.nft.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.ssafy.yammy.nft.dto.NftMintResponse;
import com.ssafy.yammy.ticket.entity.Ticket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.io.IOException;
import java.math.BigInteger;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NftService {

    @Value("${nft.contract-address}")
    private String contractAddress;

    @Value("${nft.rpc-url}")
    private String rpcUrl;

    @Value("${nft.private-key}")
    private String privateKey;

    @Value("${nft.owner-address}")
    private String nftOwnerAddress;

    @Value("${ipfs.api-key}")
    private String pinataApiKey;

    @Value("${ipfs.api-secret}")
    private String pinataApiSecret;

    @Value("${ipfs.gateway}")
    private String pinataGateway;

    private final Gson gson = new Gson();
    private final OkHttpClient httpClient = new OkHttpClient();
    private final com.ssafy.yammy.ticket.repository.TicketRepository ticketRepository;

    /**
     * 티켓 NFT 발급 (이미지 포함)
     * userWalletAddress가 null이면 서비스 지갑으로 발급
     * 멱등성 보장: 재시도 시 이미 업로드된 IPFS 데이터 재사용
     */
    public NftMintResponse mintTicketNft(Ticket ticket, String userWalletAddress, MultipartFile photo) {
        String imageHash = null;
        String metadataHash = null;
        String metadataUri = null;

        try {
            // 지갑 주소가 없으면 서비스 지갑 사용 (커스터디 방식)
            String targetWallet = userWalletAddress;
            if (targetWallet == null || targetWallet.trim().isEmpty()) {
                targetWallet = nftOwnerAddress;
                log.info("NFT 발급 시작 (커스터디 방식) - ticketId: {}, 서비스 지갑: {}", ticket.getTicketId(), targetWallet);
            } else {
                log.info("NFT 발급 시작 (사용자 지갑) - ticketId: {}, wallet: {}", ticket.getTicketId(), targetWallet);
            }

            // 1. 이미지 IPFS 업로드 (멱등성 보장)
            if (photo != null && !photo.isEmpty()) {
                // 새로 전송된 photo가 있으면 우선 사용 (전체 티켓 이미지)
                imageHash = uploadImageToPinata(photo, "yammy-ticket-" + ticket.getTicketId());
                log.info("새 이미지 IPFS 업로드 완료 - ticketId: {}, hash: {}", ticket.getTicketId(), imageHash);

                // 즉시 DB 저장 (실패해도 재사용 가능)
                ticket.setIpfsImageHash(imageHash);
                ticketRepository.save(ticket);
                log.info("이미지 해시 DB 저장 완료");
            } else if (ticket.getIpfsImageHash() != null) {
                // photo가 없으면 기존 이미지 재사용
                imageHash = ticket.getIpfsImageHash();
                log.info("기존 IPFS 이미지 재사용 - ticketId: {}, hash: {}", ticket.getTicketId(), imageHash);
            }

            String imageIpfsUri = imageHash != null ? pinataGateway + imageHash : null;

            // 2. 메타데이터 IPFS 업로드 (항상 새로 생성)
            // 이미지가 새로 업로드되었거나 기존 이미지를 사용하든, 메타데이터는 항상 최신 정보로 생성
            String metadata = createMetadata(ticket, imageIpfsUri);
            metadataHash = uploadJsonToPinata(metadata, "yammy-ticket-nft-" + ticket.getTicketId() + ".json");
            metadataUri = "ipfs://" + metadataHash;
            log.info("메타데이터 IPFS 업로드 완료 - ticketId: {}, hash: {}", ticket.getTicketId(), metadataHash);

            // DB에 메타데이터 해시 저장
            ticket.setIpfsMetadataHash(metadataHash);
            ticketRepository.save(ticket);
            log.info("메타데이터 해시 DB 저장 완료");

            // 3. 스마트 컨트랙트 호출 (mintTicket)
            log.info("블록체인 트랜잭션 시작 - ticketId: {}", ticket.getTicketId());
            TransactionReceipt receipt = mintNftOnChain(
                targetWallet,
                ticket.getTicketId(),
                metadataUri
            );

            // 4. 토큰 ID 파싱 (이벤트에서 추출)
            Long tokenId = parseTokenIdFromReceipt(receipt);

            log.info("NFT 발급 완료 - ticketId: {}, tokenId: {}, txHash: {}",
                    ticket.getTicketId(), tokenId, receipt.getTransactionHash());

            return NftMintResponse.builder()
                    .tokenId(tokenId)
                    .metadataUri(metadataUri)
                    .transactionHash(receipt.getTransactionHash())
                    .imageIpfsHash(imageHash)
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("NFT 발급 실패 - ticketId: {}, 단계: {}",
                ticket.getTicketId(),
                imageHash == null ? "이미지 업로드" :
                metadataHash == null ? "메타데이터 업로드" : "블록체인 트랜잭션",
                e);

            // 중간 결과 반환 (재시도 시 활용)
            return NftMintResponse.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .imageIpfsHash(imageHash)  // 업로드 성공한 이미지 해시 포함
                    .build();
        }
    }

    /**
     * 티켓 NFT 발급 (이미 업로드된 이미지 해시 사용)
     * 멱등성 보장: 재시도 시 이미 업로드된 IPFS 데이터 재사용
     */
    public NftMintResponse mintTicketNftWithHash(Ticket ticket, String userWalletAddress, String imageHash) {
        String metadataHash = null;
        String metadataUri = null;

        try {
            log.info("NFT 발급 시작 (기존 이미지 재사용) - ticketId: {}, wallet: {}, imageHash: {}",
                    ticket.getTicketId(), userWalletAddress, imageHash);

            String imageIpfsUri = null;
            if (imageHash != null) {
                imageIpfsUri = pinataGateway + imageHash;
            }

            // 1. 메타데이터 IPFS 업로드 (멱등성 보장)
            if (ticket.getIpfsMetadataHash() != null) {
                // 이미 업로드된 메타데이터 재사용
                metadataHash = ticket.getIpfsMetadataHash();
                metadataUri = "ipfs://" + metadataHash;
                log.info("기존 IPFS 메타데이터 재사용 - ticketId: {}, hash: {}", ticket.getTicketId(), metadataHash);
            } else {
                // 새로 업로드
                String metadata = createMetadata(ticket, imageIpfsUri);
                metadataHash = uploadJsonToPinata(metadata, "yammy-ticket-" + ticket.getTicketId() + ".json");
                metadataUri = "ipfs://" + metadataHash;
                log.info("메타데이터 IPFS 업로드 완료 - ticketId: {}, hash: {}", ticket.getTicketId(), metadataHash);

                // 즉시 DB 저장 (실패해도 재사용 가능)
                ticket.setIpfsMetadataHash(metadataHash);
                ticketRepository.save(ticket);
                log.info("메타데이터 해시 DB 저장 완료");
            }

            // 2. 스마트 컨트랙트 호출 (mintTicket)
            log.info("블록체인 트랜잭션 시작 - ticketId: {}", ticket.getTicketId());
            TransactionReceipt receipt = mintNftOnChain(
                userWalletAddress,
                ticket.getTicketId(),
                metadataUri
            );

            // 3. 토큰 ID 파싱 (이벤트에서 추출)
            Long tokenId = parseTokenIdFromReceipt(receipt);

            log.info("NFT 발급 완료 - ticketId: {}, tokenId: {}, txHash: {}",
                    ticket.getTicketId(), tokenId, receipt.getTransactionHash());

            return NftMintResponse.builder()
                    .tokenId(tokenId)
                    .metadataUri(metadataUri)
                    .transactionHash(receipt.getTransactionHash())
                    .imageIpfsHash(imageHash)
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("NFT 발급 실패 - ticketId: {}, 단계: {}",
                ticket.getTicketId(),
                metadataHash == null ? "메타데이터 업로드" : "블록체인 트랜잭션",
                e);

            // 중간 결과 반환 (재시도 시 활용)
            return NftMintResponse.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .imageIpfsHash(imageHash)
                    .build();
        }
    }

    /**
     * 메타데이터 JSON 생성
     */
    private String createMetadata(Ticket ticket, String imageIpfsUri) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("name", "Yammy Ticket #" + ticket.getTicketId());
        metadata.put("description", String.format("%s @ %s (%s)",
                ticket.getGame(), ticket.getLocation(), ticket.getDate()));

        // 이미지 (IPFS URL 사용)
        if (imageIpfsUri != null) {
            metadata.put("image", imageIpfsUri);
        }

        // Attributes (OpenSea 형식)
        List<Map<String, String>> attributes = new ArrayList<>();
        attributes.add(Map.of("trait_type", "Game", "value", ticket.getGame()));
        attributes.add(Map.of("trait_type", "Date", "value", ticket.getDate().toString()));
        attributes.add(Map.of("trait_type", "Location", "value", ticket.getLocation()));
        attributes.add(Map.of("trait_type", "Seat", "value", ticket.getSeat()));

        if (ticket.getType() != null) {
            attributes.add(Map.of("trait_type", "Type", "value", ticket.getType()));
        }

        if (ticket.getHomeScore() != null && ticket.getAwayScore() != null) {
            attributes.add(Map.of("trait_type", "Score",
                    "value", ticket.getHomeScore() + ":" + ticket.getAwayScore()));
        }

        metadata.put("attributes", attributes);

        // Properties (추가 정보)
        Map<String, Object> properties = new HashMap<>();
        properties.put("ticket_id", ticket.getTicketId());
        properties.put("comment", ticket.getComment());
        properties.put("created_at", ticket.getCreatedAt().toString());
        metadata.put("properties", properties);

        return gson.toJson(metadata);
    }

    /**
     * Pinata IPFS에 이미지 파일 업로드
     */
    public String uploadImageToPinata(MultipartFile file, String fileName) throws IOException {
        RequestBody fileBody = RequestBody.create(
                file.getBytes(),
                MediaType.parse(file.getContentType())
        );

        MultipartBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", fileName + ".jpg", fileBody)
                .addFormDataPart("pinataMetadata", gson.toJson(Map.of("name", fileName)))
                .build();

        Request request = new Request.Builder()
                .url("https://api.pinata.cloud/pinning/pinFileToIPFS")
                .post(requestBody)
                .addHeader("pinata_api_key", pinataApiKey)
                .addHeader("pinata_secret_api_key", pinataApiSecret)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Pinata 이미지 업로드 실패: " + response);
            }

            String responseBody = response.body().string();
            JsonObject result = gson.fromJson(responseBody, JsonObject.class);
            return result.get("IpfsHash").getAsString();
        }
    }

    /**
     * Pinata IPFS에 JSON 메타데이터 업로드
     */
    private String uploadJsonToPinata(String jsonContent, String fileName) throws IOException {
        Map<String, Object> pinataBody = new HashMap<>();
        pinataBody.put("pinataContent", gson.fromJson(jsonContent, Object.class));

        Map<String, String> pinataMetadata = new HashMap<>();
        pinataMetadata.put("name", fileName);
        pinataBody.put("pinataMetadata", pinataMetadata);

        RequestBody body = RequestBody.create(
                gson.toJson(pinataBody),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url("https://api.pinata.cloud/pinning/pinJSONToIPFS")
                .post(body)
                .addHeader("pinata_api_key", pinataApiKey)
                .addHeader("pinata_secret_api_key", pinataApiSecret)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Pinata JSON 업로드 실패: " + response);
            }

            String responseBody = response.body().string();
            if (responseBody == null) {
                throw new IOException("Pinata 응답이 비어있습니다");
            }

            JsonObject result = gson.fromJson(responseBody, JsonObject.class);
            return result.get("IpfsHash").getAsString();
        }
    }

    /**
     * 블록체인에 NFT 발급
     */
    private TransactionReceipt mintNftOnChain(String toAddress, Long ticketId, String tokenUri)
            throws Exception {

        Web3j web3j = Web3j.build(new HttpService(rpcUrl));
        Credentials credentials = Credentials.create(privateKey);

        // mintTicket(address to, uint256 ticketId, string memory tokenURI)
        Function function = new Function(
                "mintTicket",
                Arrays.asList(
                        new Address(toAddress),
                        new Uint256(BigInteger.valueOf(ticketId)),
                        new Utf8String(tokenUri)
                ),
                Collections.emptyList()
        );

        String encodedFunction = FunctionEncoder.encode(function);

        // Sepolia Chain ID
        long chainId = 11155111L;

        RawTransactionManager txManager = new RawTransactionManager(
                web3j, credentials, chainId
        );

        EthSendTransaction ethSendTransaction = txManager.sendTransaction(
                DefaultGasProvider.GAS_PRICE,
                DefaultGasProvider.GAS_LIMIT,
                contractAddress,
                encodedFunction,
                BigInteger.ZERO
        );

        String transactionHash = ethSendTransaction.getTransactionHash();

        // 트랜잭션 영수증 대기 (최대 30초, 5초 간격으로 6번 시도)
        Optional<TransactionReceipt> receiptOptional = Optional.empty();
        int maxRetries = 6;
        int retryDelay = 5000; // 5초

        for (int i = 0; i < maxRetries; i++) {
            receiptOptional = web3j.ethGetTransactionReceipt(transactionHash)
                    .send()
                    .getTransactionReceipt();

            if (receiptOptional.isPresent()) {
                log.info("트랜잭션 영수증 수신 성공 - 시도 횟수: {}", i + 1);
                break;
            }

            if (i < maxRetries - 1) {
                log.info("트랜잭션 영수증 대기 중... ({}초 후 재시도)", retryDelay / 1000);
                Thread.sleep(retryDelay);
            }
        }

        TransactionReceipt receipt = receiptOptional.orElseThrow(() ->
            new RuntimeException("트랜잭션 영수증을 받을 수 없습니다 (30초 타임아웃): " + transactionHash));

        // 트랜잭션 성공 여부 확인
        if (!"0x1".equals(receipt.getStatus())) {
            String errorMessage = "트랜잭션이 실패했습니다 (reverted): " + transactionHash;

            // 로그에서 에러 원인 추출 시도
            if (receipt.getLogs() != null && receipt.getLogs().isEmpty()) {
                // 로그가 비어있으면 실행 실패
                errorMessage += " - execution reverted (가능한 원인: Ticket already minted)";
            }

            log.error("블록체인 트랜잭션 실패 - txHash: {}, status: {}", transactionHash, receipt.getStatus());
            throw new RuntimeException(errorMessage);
        }

        return receipt;
    }

    /**
     * 트랜잭션 영수증에서 토큰 ID 파싱
     * TicketMinted 이벤트: event TicketMinted(uint256 indexed tokenId, uint256 indexed ticketId, address indexed owner, string tokenURI)
     * - Topic[0]: 이벤트 시그니처
     * - Topic[1]: indexed tokenId
     * - Topic[2]: indexed ticketId
     * - Topic[3]: indexed owner
     */
    private Long parseTokenIdFromReceipt(TransactionReceipt receipt) {
        if (receipt.getLogs() == null || receipt.getLogs().isEmpty()) {
            log.error("트랜잭션 영수증에 로그가 없습니다. txHash: {}", receipt.getTransactionHash());
            return 0L;
        }

        try {
            // Transfer 이벤트 시그니처 (정확한 구분을 위해)
            final String TRANSFER_EVENT_SIG = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

            // 모든 로그를 순회하면서 TicketMinted 이벤트 찾기
            for (Log eventLog : receipt.getLogs()) {
                if (eventLog.getTopics().size() == 4) {
                    String eventSignature = eventLog.getTopics().get(0);

                    // Transfer 이벤트는 건너뜀
                    if (TRANSFER_EVENT_SIG.equals(eventSignature)) {
                        continue;
                    }

                    // Transfer가 아닌 Topics 4개 이벤트 = TicketMinted
                    String tokenIdHex = eventLog.getTopics().get(1);
                    Long tokenId = new BigInteger(tokenIdHex.substring(2), 16).longValue();
                    log.info("NFT Token ID 파싱 완료: {}", tokenId);
                    return tokenId;
                }
            }

            log.error("TicketMinted 이벤트를 찾을 수 없습니다");
            return 0L;
        } catch (Exception e) {
            log.error("Token ID 파싱 실패", e);
            return 0L;
        }
    }
}
