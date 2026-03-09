# SpoonLabs Random Lunch

스푼랩스 사내 이벤트용 랜덤런치 신청 사이트입니다.

## 포함 기능

- 이름 입력 후 신청 / 같이 신청
- 신청자 이름 낙하 애니메이션
- 음식 이모지 낙하 애니메이션
- 신청 취소 기능
- Google Sheets 저장
- Netlify Functions 기반 서버리스 API
- GitHub push 시 Netlify 자동 재배포

## 기술 스택

- Vite
- React
- Framer Motion
- Netlify Functions
- Google Sheets API

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포 전 준비

### 1) Google Cloud Service Account 생성

Google Sheets API를 사용할 수 있는 서비스 계정을 만들고 JSON 키를 발급합니다.

### 2) Google Spreadsheet 준비

시트 이름은 기본적으로 `Entries`를 사용합니다.

1행 헤더는 아래처럼 두면 됩니다.

| A | B | C | D | E |
|---|---|---|---|---|
| id | name | mode | status | createdAt |

### 3) 시트 공유

해당 스프레드시트를 서비스 계정 이메일에 편집 권한으로 공유합니다.

### 4) Netlify 환경변수 등록

Netlify > Site configuration > Environment variables 에 아래 값 등록

- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_SHEET_NAME`

## GitHub 업로드

```bash
git init
git add .
git commit -m "init random lunch"
git branch -M main
git remote add origin https://github.com/<YOUR_ID>/<YOUR_REPO>.git
git push -u origin main
```

## Netlify 연결

- Add new site
- Import from Git
- GitHub 선택
- 해당 repo 선택
- Build command: `npm run build`
- Publish directory: `dist`

## 커스터마이징 포인트

- `src/styles.css`: 컬러, 카드, 버튼, 레이아웃 조정
- `src/App.jsx`: 문구, 인터랙션, 버튼 로직 수정
- `FOOD_ITEMS`: 음식 이모지 또는 이미지로 교체

## 참고

현재 공개된 기존 사이트는 텍스트 수준만 확인 가능해서, 이 버전은 기존의 간결한 신청 구조를 유지하면서 인터랙션과 저장 기능을 추가한 재구성본입니다.
