# ZBS Rule Check - Template Validation Tool

Working tool for **Challenge 2 - Build a Template Validation Tool** in the ZBS Product Intern Home Assignment.

The tool helps a business pre-check a ZBS template before submitting it for moderation. It reads template JSON, runs a prioritized set of automated checks, returns violations with suggestions, and lists rules that still need human review.

## Sources

The rule map is based on:

- ZBS moderation rules: https://zalo.solutions/news/quy-dinh-chung-khi-kiem-duyet-mau-tin-nhan-zbs/xdygqtrjjm97k28rsh07wr72
- Purpose/Tag setup guide: https://zalo.solutions/blog/thiet-lap-muc-dich-gui-khi-tao-mau-zns/jnb3n2isrtlb21vts4dpiyzb
- Image feature announcement: https://zalo.solutions/news/ra-mat-tinh-nang-thiet-lap-hinh-anh-trong-mau-tin-zns/ekq3tifzt6g0n8hlfwwjzt1q
- Image module rules: https://zalo.solutions/news/huong-dan-cac-quy-dinh-xet-duyet-template-zns-chua-module-hinh-anh/pkk6ds8irzpv7mok9hebggji
- Zalo community policy: https://help.zalo.me/huong-dan/chuyen-muc/chinh-sach-cong-dong-zalo/

## How To Run

```bash
npm install
npm run dev
npm run build
```

Open the local Vite URL, choose a sample or paste JSON, then click **Kiểm tra thử ngay!**.

## Deliverables

- Rule map: [`public/design/zbs_rule_map.md`](public/design/zbs_rule_map.md)
- Explanation docs: [`docs1/`](docs1/)
  - Read first: [`docs1/06-ban-de-doc-de-hieu.md`](docs1/06-ban-de-doc-de-hieu.md)
  - Interview/talking script: [`docs1/07-script-noi-voi-giam-khao.md`](docs1/07-script-noi-voi-giam-khao.md)
  - Detailed README explanation: [`docs1/08-giai-thich-readme-that-chi-tiet.md`](docs1/08-giai-thich-readme-that-chi-tiet.md)
- Tool code:
  - `src/lib/adapter.ts` - normalizes JSON input
  - `src/lib/rules.ts` - prioritized checks + human review checklist
  - `src/lib/samples.ts` - example inputs

## Approach

### Step 1 - Map The Rules

I mapped the official ZBS rules into internal rule groups:

- `T` - Tag / purpose selection
- `G` - General moderation rules
- `P` - Purpose-specific rules
- `S` - Special cases such as payment, holidays, restricted industries
- `H` - Image module rules

These codes are **my internal rule map**, not official Zalo rule IDs. Each code is tied back to the official source section, such as `Zalo II.1`, `Zalo II.2`, `Zalo IV`, or the image-module rules.

### Step 2 - Prioritize Checks

The assignment explicitly allows prioritization: from the rule map, I selected the rules I judged most important to validate automatically. I prioritized checks that:

1. Can be validated reliably from JSON/content.
2. Have high impact in the provided sample rejects.
3. Avoid high false-positive human judgments.

Automated/semi-automated checks:

| Check | Code | Source | Level | What it catches |
|---|---|---|---|---|
| `MISSING_IDENTIFIER` | `P1` | Zalo II.2 | Auto | Missing customer name / transaction identifier |
| `URL_IN_BODY` | `G1` | Zalo II.1 | Auto | URL in body instead of CTA |
| `PHONE_IN_BODY` | `G2` | Zalo II.1 | Auto | Phone/hotline in body instead of CTA |
| `GROUP_CHAT_LINK` | `G4` | Zalo II.1 | Auto | Group/chat/social links |
| `SUSPICIOUS_TYPO` | `G7` | Zalo II.1 | Semi | Known typo patterns, e.g. "KICH HOA" |
| `WORDING` | `P4` | Zalo II.2 | Semi | Ambiguous wording like "don hang" when it should be "ma don hang" |
| `SHORTENED_LINK` | `G3` | Zalo II.1 | Auto | Shortened URLs |
| `EMOJI_SPECIAL` | `G5` | Zalo II.1 | Auto | Emoji / decorative characters |
| `PARAM_FORMAT` | `G8` | Zalo II.1 | Auto | Invalid `<param>` format |
| `PARAM_NO_PREFIX` | `G9` | Zalo II.1 | Semi | Parameter standing alone without a label |

Human-review checklist:

- Recipient has a prior transaction (`P2`)
- Payment account belongs to the OA business or has authorization (`S2`)
- Logo/brand ownership (`G10/G12`)
- Restricted industries/products and community-policy risk (`S3/G11`)
- Promotion/public campaign context (`P5`)
- Voucher/holiday/birthday special cases (`S1`)
- Image module requirements (`H1/H2/H3`)

## Input Notes

The tool supports:

1. **Valid ZBS JSON** with `root.sections[]`.
2. **Flat demo schema** like `{ content, buttons, params, tag }`.

The attached Excel sample contains pseudo/invalid JSON display strings such as `string"..."`, `{7 items`, and `booltrue`. The tool intentionally detects that format and reports a friendly invalid-input message. This is used to test error handling, not treated as valid JSON.

Important: a `pass` result means the tool did not find violations in the prioritized automated checks. It does **not** guarantee Zalo approval because several official rules require human review, documents, image inspection, transaction context, or business ownership verification.

## Example Coverage

The built-in samples mirror the important rejection patterns from the assignment sheet:

| Template ID | Expected tool result |
|---|---|
| `589221` | `URL_IN_BODY` + `PHONE_IN_BODY` |
| `588255` | `GROUP_CHAT_LINK` |
| `589269` | `MISSING_IDENTIFIER` |
| `589220` | `SUSPICIOUS_TYPO` |
| `588636` | Payment ownership checklist + wording risk |
| `587432` | Identifier/prefix issue, documented in `docs1/04-sample-review.md` |

## AI Usage

AI was used to help read the official rules, structure the rule map, prioritize checks, implement the TypeScript validation logic, and draft the explanation docs. The tool intentionally does not claim full Zalo moderation coverage because several rules require human judgment, external business evidence, image review, or transaction context.
