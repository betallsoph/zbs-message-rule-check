# Giải thích flow tool ZBS Rule Check (chi tiết + lý do)

Tài liệu này giải thích **tool chạy như thế nào** và **tại sao lại thiết kế vậy**, từ lúc
người dùng dán JSON đến lúc ra kết quả. Đọc từ trên xuống là hiểu toàn bộ.

---

## 0. TL;DR (một đoạn)

Người dùng dán **JSON của một mẫu tin ZBS** (hoặc chọn mẫu có sẵn) + chọn **Loại
template**, rồi bấm **"Kiểm tra thử ngay!"**. Tool sẽ: (1) nhận diện định dạng JSON,
(2) **chuẩn hoá** nó về một cấu trúc gọn chung, (3) chạy **10 luật kiểm tra tự động**
trên đó, (4) in ra **danh sách vi phạm + gợi ý sửa**, đồng thời (5) in ra **checklist
những thứ máy không tự phán được** (cần người/giấy tờ). Toàn bộ chạy **ngay trên trình
duyệt**, không có server.

---

## 1. Bức tranh lớn — tool giải quyết gì

Trên Zalo, doanh nghiệp (DN) muốn gửi tin (OTP, xác nhận đơn, nhắc thanh toán…) thì
mỗi **mẫu tin (template)** phải qua **kiểm duyệt** theo một bộ quy định. Rất nhiều DN bị
**từ chối (reject)** vì lỗi lặt vặt: để số điện thoại/link trong nội dung, thiếu tham
số định danh, lỗi chính tả…

→ Tool này giúp DN **tự soi mẫu trước khi gửi duyệt**, bắt sớm các lỗi máy kiểm được,
và nhắc trước những mục cần con người xem (giấy tờ, ngữ cảnh).

Đây là bài **Challenge 2** của đề "ZBS Product Intern Home Assignment": *đọc bộ luật →
biến thành logic → build tool → in ra vi phạm*.

---

## 2. Kiến trúc file (mỗi file lo một việc)

| File | Vai trò |
|------|---------|
| `src/App.tsx` | Giao diện + điều phối: giữ state, gọi `analyze()`, vẽ 3 cột. |
| `src/lib/types.ts` | Định nghĩa kiểu dữ liệu dùng chung (ZbsTemplate, Finding…). |
| `src/lib/adapter.ts` | **Đọc & chuẩn hoá input**: nhận diện format, bóc text/link/param ra khỏi JSON lồng. |
| `src/lib/rules.ts` | **Bộ luật**: 10 check tự động + checklist người + hàm chạy `moderate()`. |
| `src/lib/samples.ts` | 10 mẫu ví dụ (bám theo template thật trong đề). |
| `src/components/RoomioSelect.tsx` | Dropdown tự vẽ (không dùng dropdown mặc định của browser). |
| `src/components/RulesModal.tsx` | Popup "Bảng rule" (liệt kê 10 check theo ưu tiên). |
| `src/lib/tapInteractions.ts` | Hiệu ứng nút bấm (nhún/bounce) toàn cục. |
| `public/design/zbs_rule_map.md` | Bản đồ luật (Step 1) + lý do chọn (Step 2). |

**Ý tưởng cốt lõi:** tách **"đọc input"** (adapter) khỏi **"chấm luật"** (rules). Nhờ
vậy dù input có nhiều dạng JSON khác nhau, phần luật vẫn chỉ làm việc trên **một cấu
trúc chuẩn duy nhất** → dễ hiểu, dễ test.

---

## 3. Flow tổng quát (nhìn 1 phát là hiểu)

```
[Người dùng]
   │  chọn mẫu / dán JSON + chọn Loại template
   ▼
[Bấm "Kiểm tra thử ngay!"]
   │  App lưu snapshot { input, type } vào state `submitted`
   ▼
analyze(input, type)                         ── src/App.tsx
   ├─ rỗng? / là format hiển thị của sheet? → báo lỗi mềm
   ├─ JSON.parse  → hỏng? → báo lỗi
   ├─ detectFormat → 'zbs' hay 'flat'?       ── src/lib/adapter.ts
   ├─ normalizeZbs / normalizeFlat → ZbsTemplate (cấu trúc chuẩn)
   │       (bóc content, link CTA, param, cờ logo, gán Tag theo loại)
   └─ moderate(template)                     ── src/lib/rules.ts
           ├─ chạy 10 check → gom errors / warnings
           └─ buildChecklist → 6 mục human review (bật cờ "có dấu hiệu")
   ▼
ModerationResult { status, errors, warnings, checklist, tag, paramCount }
   ▼
[Vẽ 3 cột]                                   ── src/App.tsx
   Cột 1: Input   │  Cột 2: Kết quả (lỗi/cảnh báo)  │  Cột 3: Cần người kiểm duyệt
```

Điểm quan trọng: **mọi thứ sau `JSON.parse` đều có kiểu chặt chẽ** (không dùng `any`).
`JSON.parse` là ranh giới `any` duy nhất, sau đó ép về kiểu `JsonValue` và đi tiếp.

---

## 4. Chi tiết từng bước

### 4.1. Input — hỗ trợ 2 định dạng JSON

Tool tự nhận diện, người dùng không phải khai báo:

1. **JSON ZBS thật** — cấu trúc `root.sections[]` **lồng sâu** đúng như sheet đề bài.
   Nội dung nằm rải rác nhiều chỗ:
   - tiêu đề/đoạn văn: `sections[].banner.title.text`
   - bảng thông tin: `sections[].map_info.items[].key.title.text` (nhãn) và `.value.title.text` (giá trị)
   - đoạn: `paragraph`, thẻ carousel: `c_title` / `c_paragraph`, OTP: `banner.title.text`
   - link/nút bấm: `sections[].buttons.items[].click.data`
   - tham số: bọc `<...>` hoặc `<span class="param"><...></span>`

2. **Schema phẳng** — gọn cho demo nhanh: `{ content, buttons, params }`.

**Vì sao hỗ trợ cả 2?** JSON thật rất rối, lồng 5–6 tầng. Schema phẳng giúp thử nhanh
1 câu nội dung mà không cần dựng cả cây `root.sections`. Adapter đưa **cả hai về cùng
một `ZbsTemplate`** nên phần luật không cần biết input đến từ dạng nào.

> **Cạm bẫy đã xử lý:** ô trong sheet Excel hiển thị JSON theo kiểu "viewer"
> (`"oa_id":string"278780515"`, `{7 items`) — **đó KHÔNG phải JSON hợp lệ**. Nếu người
> dùng copy nguyên ô đó dán vào, tool nhận ra (regex `PSEUDO_RE`) và **báo lỗi thân
> thiện** "hãy dán JSON thật", thay vì crash khó hiểu.

### 4.2. Loại template → Tag

Bộ luật chia mẫu thành 3 Tag: **Tag 1 Giao dịch · Tag 2 Chăm sóc KH · Tag 3 Hậu mãi**.
Một số luật chỉ áp cho Tag nhất định (vd luật "phải có định danh KH" chỉ bắt Tag 1).

**Vấn đề:** JSON thật **không có** trường Tag. → Giải pháp: cho người dùng **chọn Loại
template** (Payment / Voucher / Rating / OTP / Tuỳ chỉnh / Carousel) qua dropdown, rồi
map ra Tag (`tagOfType` trong `adapter.ts`):

| Loại chọn | Tag suy ra |
|-----------|-----------|
| Payment, OTP, Tuỳ chỉnh | Tag 1 (Giao dịch) |
| Voucher, Carousel | Tag 2 (Chăm sóc KH) |
| Rating | Tag 3 (Hậu mãi) |

**Vì sao để người chọn thay vì máy đoán?** Đoán sai Tag sẽ kéo theo chấm sai hàng loạt
luật con. Cho người chọn = 1 click, đổi lại độ chính xác. (Đây cũng là một quyết định
**prioritization**: cố tình *không* tự động phân loại Tag.)

### 4.3. `analyze()` — cửa ngõ, chặn mọi case xấu

Nằm trong `App.tsx`. Thứ tự kiểm tra (mỗi bước fail thì trả lỗi mềm, **không crash**):

1. **Rỗng** → "Chưa có nội dung JSON."
2. **Là format hiển thị của sheet** (`PSEUDO_RE`) → nhắc dán JSON chuẩn.
3. **`JSON.parse` lỗi** → "JSON không hợp lệ: …"
4. **Không phải object** (vd là mảng, số) → "JSON phải là một object mẫu tin."
5. `detectFormat` → chọn nhánh `normalizeZbs` hay `normalizeFlat`.
6. **Bọc `try/catch`** quanh normalize + moderate: dữ liệu méo mó bất thường
   (lồng sâu, kiểu sai) cũng chỉ ra **lỗi mềm**, không làm trắng màn hình.
7. Nếu chuẩn hoá xong mà **không bóc được nội dung lẫn nút nào** → báo "không trích
   được nội dung".

→ Kết quả `analyze` là một trong hai:
`{ ok: true, result, format }` **hoặc** `{ ok: false, error }`.

### 4.4. Chuẩn hoá — biến JSON rối thành `ZbsTemplate` gọn

`ZbsTemplate` (cấu trúc chuẩn mà toàn bộ luật làm việc trên đó):

```ts
{
  id?, type, tag,        // định danh + loại + Tag
  content: string,       // TẤT CẢ text nội dung, nối bằng "\n"
  buttons: [{ url }],    // các link trong CTA
  params?: string[],     // (chỉ dùng cho schema phẳng)
  hasLogo: boolean,      // có logo/ảnh thương hiệu? → phục vụ checklist G10
  otpExempt: boolean,    // là OTP? → miễn vài luật
}
```

**`normalizeZbs`** dùng một hàm **duyệt cây đệ quy** (`extract`) đi khắp `root.sections`:
- Gặp **key chứa text** (`text`, `paragraph`, `c_title`, `c_paragraph`, `des`, `title`)
  mà **không nằm trong `buttons`** → gom vào `content`.
- Gặp **`map_info`** → ghép **nhãn + giá trị trên CÙNG một dòng** (vd
  `"Khách hàng <TenKH>"`). *Vì sao?* Nếu để nhãn và giá trị ở 2 dòng, luật G9 (biến
  thiếu nhãn) sẽ báo nhầm là biến đứng trơ.
- Gặp **link** (`data`, `c_data`, `data_detail`…) → bóc URL ra bỏ vào `buttons`.
- Có `logo` / `oa_info` / `img` → bật `hasLogo`.
- Cuối cùng `stripHtml` gỡ thẻ `<span class="param">` để lộ ra biến `<...>` sạch.

**`normalizeFlat`** đơn giản hơn: đọc thẳng `content/buttons/params`, nhưng **có kiểm
tra kiểu** từng phần tử (`toButtons`, `toStringArray`) để `buttons: [null]` hay dữ liệu
lỗi **không làm crash**.

**Tại sao gom hết text vào một `content` string?** Vì phần lớn luật (SĐT, link, emoji,
typo, wording…) chỉ cần soi **văn bản hiển thị cho người đọc**. Gom về một chuỗi giúp
mỗi luật chỉ là một cú quét regex đơn giản, thay vì phải lặn vào cây JSON.

**Tại sao tách link CTA riêng?** Vì luật G1/G2 nói *"link & SĐT phải nằm ở nút CTA,
KHÔNG được ở nội dung"*. Nên link trong `buttons` là **hợp lệ**, còn link lẫn trong
`content` là **vi phạm**. Phải tách 2 chỗ mới phân biệt đúng/sai được.

### 4.5. `moderate()` — chạy luật & chấm điểm

```
moderate(template):
   findings = [chạy lần lượt 10 hàm check]  // mỗi hàm trả 0 hoặc 1 Finding
   errors   = findings có severity 'error'   // 🟢 máy tự từ chối
   warnings = findings có severity 'warning'  // 🟡 máy cảnh báo, người xác nhận
   checklist = buildChecklist(template)       // 🔴 máy không tự phán
   status = 'fail'   nếu có errors
          | 'review' nếu chỉ có warnings
          | 'pass'   nếu sạch
```

#### 10 check tự động (nằm trong `rules.ts`)

| Check | Luật | Mức | Bắt cái gì | Cách làm |
|-------|------|-----|-----------|----------|
| `PHONE_IN_BODY` | G2 | error | SĐT/hotline trong nội dung | regex số VN; **bỏ qua** số nằm cạnh chữ "tài khoản/STK" (đó là số TK, không phải SĐT) |
| `URL_IN_BODY` | G1 | error | Link trong nội dung | regex `http(s)://` hoặc tên miền trần trong `content` |
| `GROUP_CHAT_LINK` | G4 | error | Link nhóm/chat | so khớp domain: `zalo.me/g/`, `t.me/`, `m.me/`, FB groups… (KHÔNG bắt `oa.zalo.me` — đó là link OA hợp lệ) |
| `SHORTENED_LINK` | G3 | error | Link rút gọn | blacklist `bit.ly`, `tinyurl`, `onelink`… |
| `MISSING_IDENTIFIER` | P1 | error | Tag 1 thiếu định danh | phải có **1 biến tên KH** *và* **1 biến mã** (`<TenKH>` + `<MaKH>`). Bỏ qua nếu là OTP |
| `PARAM_FORMAT` | G8 | error | Sai định dạng biến | mỗi `<...>` phải là `<a_b_c>` (không dấu cách/tiếng Việt) |
| `EMOJI_SPECIAL` | G5 | error | Emoji/ký tự trang trí | quét dải Unicode emoji (đã **loại** dấu câu hợp lệ như —, …, "") |
| `PARAM_NO_PREFIX` | G9 | warning | Biến đứng trơ, thiếu nhãn | dòng chỉ toàn biến, không có chữ mô tả. Bỏ qua nếu OTP |
| `SUSPICIOUS_TYPO` | G7 | warning | Nghi lỗi đánh máy | từ điển hẹp: "KÍCH HỌA", "quý kách"… |
| `WORDING` | P4 | warning | "đơn hàng <mã>" thiếu "mã" | bắt "đơn hàng" đứng ngay trước số/biến mà không có tiền tố "mã" |

> **Chi tiết nghề nghiệp** trong vài luật:
> - `PHONE_IN_BODY` bỏ qua số cạnh "tài khoản": vì `0588636112` có thể là **số tài
>   khoản ngân hàng** (thuộc mục người kiểm duyệt S2), không phải SĐT.
> - `EMOJI_SPECIAL` **không** dùng nguyên khối "General Punctuation" của Unicode, vì
>   khối đó chứa gạch ngang dài `—`, ba chấm `…`, nháy cong — đều là dấu câu **hợp lệ**.
> - `WORDING` chỉ bắt "đơn hàng" khi **đứng trước mã** (vd "Đơn hàng 589269"), còn
>   "Xác nhận đơn hàng" (dùng chung) thì bỏ qua — tránh báo nhầm.

Mỗi `Finding` mang: `label` (tên), `rule` (mã luật gốc), `message` (mô tả), `evidence`
(đoạn text bắt được), `suggestion` (gợi ý sửa) — để cột kết quả hiển thị đầy đủ.

#### Checklist human review (`buildChecklist`)

6 mục **máy không tự phán** vì cần giấy tờ/ngữ cảnh — chỉ **bật cờ "có dấu hiệu"** khi
gặp dấu hiệu, còn lại chỉ liệt kê để nhắc:

| Mục | Luật | Bật cờ khi… |
|-----|------|-------------|
| Thanh toán đúng chủ | S2 | loại = Payment, hoặc content có "tài khoản/ngân hàng/chuyển khoản" |
| Ngành xâm lấn/hạn chế | S3 | content nhắc mỹ phẩm/rượu bia/TPCN/thuốc… |
| Lễ Tết/sinh nhật | S1 | loại = Voucher, hoặc content nhắc lễ/Tết/sinh nhật |
| Quyền sở hữu logo | G10 | `hasLogo` = true |
| Có phát sinh giao dịch | P2 | (luôn liệt kê, không tự bật) |
| Chương trình công khai | S5 | loại = Rating |

**Vì sao không để máy tự quyết mấy cái này?** Vì "STK có đúng chủ OA không", "ngành này
có giấy phép chưa", "logo có được phép dùng không" — **không thể biết từ JSON**, phải
đối chiếu giấy tờ. Nếu máy tự phán → **tự tin sai (false confidence)**. Thà nói thẳng
"cần người xem" còn hơn phán bừa. → **Đây là điểm product thinking quan trọng nhất:
biết chỗ nào máy nên im.**

### 4.6. Vẽ kết quả — bố cục 3 cột

- **Cột 1 — Input:** 2 dropdown (chọn mẫu + loại), ô JSON, nút "Kiểm tra thử ngay!".
- **Cột 2 — Kết quả:** chữ trạng thái (ĐẠT/CẦN SOÁT/TỪ CHỐI) + dòng tóm tắt
  (`Tag · N tham số · N lỗi · N cảnh báo`) + danh sách **Lỗi tự động** và **Cảnh báo**.
- **Cột 3 — Cần người kiểm duyệt:** mục **có dấu hiệu** hiện chi tiết; các mục còn lại
  gom **1 dòng gọn** cho đỡ rối.

Giữa 3 cột có **đường kẻ dọc mảnh** để phân tách. Trên mobile thì **xếp dọc 1 cột**.

---

## 5. Vì sao thiết kế như vậy (tổng hợp các quyết định)

| Quyết định | Lý do |
|-----------|-------|
| **Tách adapter khỏi rules** | Input JSON muôn hình vạn trạng, nhưng luật chỉ nên làm việc trên 1 cấu trúc chuẩn. Đổi input không phải sửa luật. |
| **Hỗ trợ 2 format** | JSON thật để chấm đúng đề; schema phẳng để thử nhanh. |
| **Người chọn Loại template** | JSON không có Tag; máy đoán Tag dễ sai → cho người chọn 1 click. |
| **Chỉ tự động 10/~21 luật** | Đề chấm cả **prioritization**. Chọn luật (a) máy kiểm rạch ròi + (b) hay reject thật. Cố tình **không** làm G6 (spellcheck toàn phần — nhiễu), T1/T2 (phân Tag — cần phán đoán). |
| **Ranh giới máy/người (checklist 🔴)** | Tránh false confidence: việc cần giấy tờ thì để người, máy chỉ nhắc. |
| **Chạy thủ công (nút bấm)** | Người dùng chủ động soát, không bị nhảy kết quả loạn khi đang gõ dở; cũng nhẹ máy hơn. |
| **Dropdown tự vẽ (RoomioSelect)** | Đồng bộ giao diện với hệ thiết kế Roomio, không lệ thuộc dropdown xấu/khác nhau của từng browser. |
| **Kiểu chặt chẽ, guard mọi input** | Người dùng có thể dán bất kỳ thứ gì → tool phải **không bao giờ crash**, chỉ báo lỗi mềm. |

---

## 6. Các case đầy đủ (đi vết từ đầu đến cuối)

### Case A — Mẫu #589221: link + SĐT trong nội dung → TỪ CHỐI
- Chọn mẫu #589221 (loại Tuỳ chỉnh → Tag 1).
- `detectFormat` → có `root` → **zbs**.
- `extract` bóc `content` chứa: *"…Tra cứu tại https://vantai.example.vn/tracking hoặc
  gọi hotline 1900 6035…"* + có `<TenKH>`, `<MaDon>`.
- Chạy luật:
  - `URL_IN_BODY` bắt `https://vantai.example.vn/tracking` trong content → **lỗi**.
  - `PHONE_IN_BODY` bắt `1900 6035` → **lỗi**.
  - `MISSING_IDENTIFIER`: có tên (`<TenKH>`) + mã (`<MaDon>`) → **qua**.
- `status = fail`. Checklist: `G10` bật (có logo).
- **Kết quả:** TỪ CHỐI · 2 lỗi (G1, G2) · cột 3 nhắc G10.

### Case B — "Mẫu đạt": không vi phạm → ĐẠT
- Content sạch, có `<TenKH>` + `<MaDon>`, link nằm trong nút.
- 10 check đều qua → `status = pass`.
- Checklist chỉ `G10` bật (vì có logo).
- **Kết quả:** ĐẠT · 0 lỗi · cột 3: "Quyền sở hữu logo (G10)" + 1 dòng gọn các mục khác.

### Case C — Mẫu #588636 (Payment): STK đúng chủ → ĐẠT (auto) + cờ S2
- Loại Payment → Tag 1. Content nhắc chuyển khoản, có `<TenKH>` + `<MaKH>`.
- 10 check auto đều **qua** (số TK bị `PHONE_IN_BODY` bỏ qua nhờ cạnh chữ "Tài khoản").
- `status = pass`, **nhưng** checklist `S2` **bật** (loại Payment).
- **Kết quả:** ĐẠT về mặt tự động, **nhưng cột 3 cảnh báo "Thanh toán đúng chủ (S2) —
  cần đối chiếu chủ tài khoản"**. → minh hoạ đúng ranh giới máy/người: máy không dám
  phán STK có đúng chủ không, đẩy cho người.

### Case D — OTP: được miễn luật định danh → ĐẠT
- Loại OTP → `otpExempt = true`.
- `MISSING_IDENTIFIER` và `PARAM_NO_PREFIX` **bị bỏ qua** (OTP dùng mẫu mặc định).
- Nội dung chỉ có `<otp>` + câu cảnh báo → sạch.
- **Kết quả:** ĐẠT.

### Case E — Dán sai
- Dán chữ thường "not valid json" → `JSON.parse` lỗi → **"JSON không hợp lệ"**.
- Copy nguyên ô sheet (`"oa_id":string"…"`) → `PSEUDO_RE` khớp → **nhắc dán JSON chuẩn**.
- Dán `{ "buttons": [null] }` (thiếu content) → normalizeFlat **không crash** (đã guard),
  báo "Thiếu trường content".

### Case F — Schema phẳng (demo nhanh)
- Dán `{ "tag":"Tag 1", "content":"Chào <customer_name>, mã đơn <order_code>", "buttons":[{"url":"https://shop.vn/x"}] }`.
- `detectFormat` → không có `root`/`sections` → **flat** → `normalizeFlat`.
- Có tên + mã, link ở nút → ĐẠT.

---

## 7. Bảng tra cứu nhanh

| Muốn hiểu… | Xem file |
|------------|----------|
| Toàn bộ bộ luật gốc + lý do chọn | `public/design/zbs_rule_map.md` |
| Cách đọc/chuẩn hoá JSON | `src/lib/adapter.ts` |
| Logic 10 check + checklist | `src/lib/rules.ts` |
| Điều phối + giao diện 3 cột | `src/App.tsx` |
| 10 mẫu ví dụ | `src/lib/samples.ts` |

---

*Tóm một câu:* **đọc → chuẩn hoá về 1 cấu trúc → quét 10 luật → in vi phạm + nhắc phần
cần người.** Mọi quyết định đều xoay quanh 2 nguyên tắc: *(1) tách "đọc input" khỏi
"chấm luật"* và *(2) máy chỉ phán chỗ chắc chắn, phần cần ngữ cảnh thì nhường người.*
