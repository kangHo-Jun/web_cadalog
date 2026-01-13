# 🔑 Cafe24 Access Token 발급 가이드

Cafe24 API를 사용하기 위해서는 **Access Token**이 필요합니다. 아래 방법 중 하나를 선택하여 토큰을 발급받으세요.

## 방법 1: Cafe24 개발자 센터에서 발급 (가장 간편)
테스트 용도로 일회성 토큰이 필요한 경우 개발자 센터의 '테스트 토큰' 기능을 사용할 수 있습니다.

1. **[Cafe24 Developers](https://developers.cafe24.com/)** 로그인.
2. 상단 메뉴 **앱 관리 (App Management)** 클릭.
3. 사용 중인 **앱(App)** 선택.
4. 좌측 메뉴 **설정 > 인증 정보 (Authentication Key)** 클릭.
5. 화면 중간의 **'Access Token 발급'** 섹션 확인.
6. **'Access Token 발급받기'** 버튼 클릭하면 팝업으로 토큰이 표시됩니다.
   - *주의: 이 토큰은 유효기간(보통 2시간)이 짧을 수 있습니다.*

## 방법 2: Postman/Curl을 이용한 정식 발급 (권장)
지속적인 개발을 위해서는 `Client ID`와 `Client Secret`을 사용하여 정식으로 발급받는 것이 좋습니다.

### 1단계: 인증 코드(Code) 받기
브라우저 주소창에 아래 URL을 수정하여 입력합니다.
```
https://{mall_id}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope=mall.read_product,mall.read_category
```
- `{mall_id}`: 쇼핑몰 ID (예: `daesan3833`)
- `{client_id}`: 앱의 Client ID
- `{redirect_uri}`: 앱 설정에 등록된 Redirect URI (예: `http://localhost:3000`)
- **로그인 후 리다이렉트된 URL의 `code=` 뒷부분 값을 복사합니다.**

### 2단계: 토큰 교환하기 (Curl)
터미널에서 아래 명령어를 실행하여 토큰을 받습니다.
```bash
curl -X POST https://{mall_id}.cafe24api.com/api/v2/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "{client_id}:{client_secret}" \
  -d "grant_type=authorization_code" \
  -d "code={위에서_받은_code}" \
  -d "redirect_uri={redirect_uri}"
```
- 응답 결과의 `access_token` 값을 복사하여 `.env.local`에 적용합니다.

## 📝 .env.local 업데이트
발급받은 토큰을 프로젝트 설정 파일에 업데이트해주세요.

```bash
# .env.local
CAFE24_ACCESS_TOKEN=발급받은_새로운_토큰_값
```
