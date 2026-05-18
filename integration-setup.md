# 키오스크 로그 연동 설정

이 프로토타입의 외부 로그 저장은 **Google Sheets** 기준으로 정리했습니다.

## Google Sheets

1. Google Sheets를 하나 만듭니다.
2. 확장 프로그램 > Apps Script를 엽니다.
3. `google-sheets-apps-script.js` 내용을 붙여 넣습니다.
4. 배포 > 새 배포 > 웹 앱을 선택합니다.
5. 실행 권한과 액세스 권한을 테스트 목적에 맞게 설정합니다.
6. 발급된 Web App URL을 프로토타입 운영자 화면의 `Google Apps Script Web App URL`에 입력합니다.

## 동작 흐름

키오스크 화면에서 상태를 선택하면 추천 상품이 바뀝니다.
토출 버튼을 누르면 현재 추천 상품 기준으로 로그 payload를 만들고 Google Sheets로 전송합니다.

연동값이 비어 있으면 실제 전송은 건너뛰고 `설정 필요`로 표시됩니다.
