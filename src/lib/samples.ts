import type { TemplateType } from './types'

export interface Sample {
  key: string
  title: string
  type: TemplateType
  format: 'zbs' | 'flat'
  expect: string
  raw: unknown // object JSON (sẽ JSON.stringify để hiển thị)
}

const LOGO = { url: 'https://stc-oa.zdn.vn/uploads/2026/06/04/logo.png' }

// Section helpers cho gọn.
const oaInfo = { oa_info: { show: true, vertical: true, img: LOGO } }
const bannerTitle = (text: string) => ({
  banner: { pos: 'title', show: true, title: { text, type: 'text-title' } },
})
const bannerText = (text: string) => ({
  banner: { pos: 'body', show: true, title: { text, type: 'text-normal' } },
})
const mapInfo = (rows: [string, string][]) => ({
  map_info: {
    show_all: true,
    items: rows.map(([k, v], i) => ({
      pos: `row_${i}`,
      show: true,
      key: { title: { text: k } },
      value: { title: { text: v, type: 'table-effect-default' } },
    })),
  },
})
const buttons = (items: { text: string; action?: string; data?: string }[]) => ({
  buttons: {
    show_all: true,
    items: items.map((b, i) => ({
      text: b.text,
      type: i === 0 ? 'button-primary' : 'button-neutral',
      click: { id: String(i), action: b.action ?? 'action.open.inapp', data: b.data ?? '' },
    })),
  },
})

// ── 10 mẫu — dựng theo cấu trúc thật root.sections[] của sheet đề bài ──
export const SAMPLES: Sample[] = [
  {
    key: 'pass',
    title: 'Mẫu đạt · Tuỳ chỉnh',
    type: 'custom',
    format: 'zbs',
    expect: 'Không vi phạm',
    raw: {
      root: {
        oa_id: '267129129',
        extend_info: '267129129',
        sections: [
          oaInfo,
          bannerTitle('Xác nhận đơn hàng'),
          bannerText(
            'Cảm ơn bạn đã đặt hàng. Đơn của bạn đã được xác nhận và đang chuẩn bị giao.',
          ),
          mapInfo([
            ['Khách hàng', '<TenKH>'],
            ['Mã đơn hàng', '<MaDon>'],
            ['Tổng tiền', '<price>'],
          ]),
          buttons([
            { text: 'Xem chi tiết đơn', data: 'https://shop.example.vn/orders/track' },
          ]),
        ],
      },
    },
  },
  {
    key: '589221',
    title: '#589221 · Link + SĐT trong nội dung',
    type: 'custom',
    format: 'zbs',
    expect: 'URL_IN_BODY, PHONE_IN_BODY',
    raw: {
      root: {
        oa_id: '267129129',
        extend_info: '267129129',
        sections: [
          oaInfo,
          bannerTitle('Thông báo giao hàng'),
          bannerText(
            'Đơn của quý khách đang được giao. Tra cứu tại https://vantai.example.vn/tracking hoặc gọi hotline 1900 6035 để được hỗ trợ.',
          ),
          mapInfo([
            ['Khách hàng', '<TenKH>'],
            ['Mã đơn hàng', '<MaDon>'],
          ]),
          buttons([{ text: 'Theo dõi đơn', data: 'https://vantai.example.vn/tracking' }]),
        ],
      },
    },
  },
  {
    key: '588255',
    title: '#588255 · Link nhóm chat',
    type: 'custom',
    format: 'zbs',
    expect: 'GROUP_CHAT_LINK',
    raw: {
      root: {
        oa_id: '351705571',
        extend_info: '351705571',
        sections: [
          oaInfo,
          bannerTitle('Cảm ơn quý khách'),
          bannerText(
            'Cảm ơn <TenKH> đã tin tưởng dịch vụ. Tham gia cộng đồng để nhận ưu đãi sớm nhất.',
          ),
          mapInfo([['Mã khách hàng', '<MaKH>']]),
          buttons([{ text: 'Vào nhóm Zalo', data: 'https://zalo.me/g/abcxyz123' }]),
        ],
      },
    },
  },
  {
    key: '589269',
    title: '#589269 · Thiếu định danh',
    type: 'custom',
    format: 'zbs',
    expect: 'MISSING_IDENTIFIER',
    raw: {
      root: {
        oa_id: '375075320',
        extend_info: '375075320',
        sections: [
          oaInfo,
          bannerTitle('Thông báo tiếp nhận'),
          bannerText(
            'Đơn hàng 589269 của quý khách đã được tiếp nhận và đang xử lý. Xin cảm ơn.',
          ),
          buttons([{ text: 'Xem chi tiết', data: 'https://example.vn/don' }]),
        ],
      },
    },
  },
  {
    key: '589220',
    title: '#589220 · Lỗi đánh máy',
    type: 'custom',
    format: 'zbs',
    expect: 'SUSPICIOUS_TYPO',
    raw: {
      root: {
        oa_id: '410532407',
        extend_info: '410532407',
        sections: [
          oaInfo,
          bannerTitle('Thông báo dịch vụ'),
          bannerText(
            'Chào <TenKH>, vui lòng KÍCH HỌA dịch vụ để tiếp tục sử dụng. Xin cảm ơn quý kách.',
          ),
          mapInfo([['Mã khách hàng', '<MaKH>']]),
          buttons([{ text: 'Kích hoạt ngay', data: 'https://sv.example.vn/activate' }]),
        ],
      },
    },
  },
  {
    key: '588636',
    title: '#588636 · Payment · STK đúng chủ',
    type: 'payment',
    format: 'zbs',
    expect: 'human: S2 (máy không tự phán)',
    raw: {
      root: {
        oa_id: '197192083',
        extend_info: '197192083',
        '3rd_info':
          '{"more_utility":{"type":"payment","data":{"amount":"<price>","accountNumber":"<MaKH>"}}}',
        sections: [
          oaInfo,
          bannerTitle('Thông báo cước dịch vụ'),
          bannerText('Kính gửi <TenKH>, đơn hàng của bạn cần thanh toán số tiền như sau:'),
          mapInfo([
            ['Khách hàng', '<TenKH>'],
            ['Mã định danh', '<MaKH>'],
            ['Số tiền', '<price>'],
          ]),
          {
            open_utility: {
              type: 'payment',
              highlight_box: true,
              show: true,
              top: {
                contents: {
                  items: [
                    { pos: 'p1', text: 'Số tiền thanh toán', type: 'text-title-payment' },
                    { pos: 'p2', text: '<price>đ', type: 'text-money' },
                    {
                      pos: 'p3',
                      text: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
                      type: 'text-subtext',
                    },
                    {
                      pos: 'p4',
                      text: 'Tài khoản: <MaKH> - CÔNG TY CỔ PHẦN CÔNG NGHỆ & TRUYỀN THÔNG VIỆT NAM',
                      type: 'text-subtext',
                    },
                  ],
                },
              },
            },
          },
          buttons([
            { text: 'Thanh toán ngay', action: 'PAYMENT', data: '' },
            { text: 'Quan tâm OA', data: 'https://oa.zalo.me/1654516868936382648' },
          ]),
        ],
      },
    },
  },
  {
    key: 'emoji',
    title: 'Voucher · chứa emoji',
    type: 'voucher',
    format: 'zbs',
    expect: 'EMOJI_SPECIAL · (human: S1)',
    raw: {
      root: {
        oa_id: '321386071',
        extend_info: '321386071',
        sections: [
          oaInfo,
          bannerTitle('Ưu đãi đặc biệt'),
          bannerText('Chào <TenKH> 🎉🎁 Ưu đãi cực HOT ★ dành riêng cho bạn ✨ đừng bỏ lỡ!'),
          mapInfo([['Mã thành viên', '<CustID>']]),
          buttons([{ text: 'Nhận ưu đãi', data: 'https://example.vn/promo' }]),
        ],
      },
    },
  },
  {
    key: 'otp',
    title: 'OTP / Xác thực (đạt)',
    type: 'otp',
    format: 'zbs',
    expect: 'Không vi phạm (ngoại lệ OTP)',
    raw: {
      root: {
        oa_id: '455650915',
        extend_info: '455650915',
        sections: [
          oaInfo,
          bannerTitle('Mã xác minh của bạn là'),
          {
            banner: {
              show: true,
              title: {
                text: '<otp>',
                type: 'text-otp-blue',
                click: { action: 'action.copy.clipboard', data: '{"content":"<otp>"}' },
              },
            },
          },
          bannerText(
            'Tuyệt đối KHÔNG chia sẻ mã xác thực cho bất kỳ ai. Mã có hiệu lực trong 5 phút.',
          ),
          buttons([{ text: 'Sao chép mã', action: 'action.copy.clipboard', data: '{"content":"<otp>"}' }]),
        ],
      },
    },
  },
  {
    key: 'shorten',
    title: 'Link rút gọn ở nút bấm',
    type: 'custom',
    format: 'zbs',
    expect: 'SHORTENED_LINK',
    raw: {
      root: {
        oa_id: '267129129',
        extend_info: '267129129',
        sections: [
          oaInfo,
          bannerTitle('Ưu đãi dành cho bạn'),
          bannerText('Chào <TenKH>, ưu đãi tháng này dành riêng cho bạn.'),
          mapInfo([['Mã khách hàng', '<MaKH>']]),
          buttons([{ text: 'Nhận ưu đãi', data: 'https://bit.ly/uu-dai-thang' }]),
        ],
      },
    },
  },
  {
    key: 'flat',
    title: 'Demo · kiểu gọn',
    type: 'custom',
    format: 'flat',
    expect: 'Không vi phạm (format phẳng)',
    raw: {
      tag: 'Tag 1',
      content:
        'Chào <customer_name>,\nMã đơn hàng: <order_orderCode> của bạn đã được xác nhận.',
      buttons: [{ url: 'https://shop.example.vn/orders' }],
      params: ['<customer_name>', '<order_orderCode>'],
    },
  },
]

export const DEFAULT_SAMPLE = SAMPLES[0]
