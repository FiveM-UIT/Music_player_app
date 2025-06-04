# Music Player App

## Giới thiệu
Ứng dụng Chơi Nhạc Online là một ứng dụng web hiện đại cho phép người dùng phát nhạc từ danh sách bài hát có sẵn, tạo playlist cá nhân, xem lời bài hát, đặt hẹn giờ tắt nhạc, và nhiều tính năng nâng cao khác. Ứng dụng được xây dựng hoàn toàn trên frontend với HTML, CSS (Bootstrap), và JavaScript.

## Tính năng chính
- **Hiển thị danh sách bài hát**: Xem và chọn bài hát từ danh sách hoặc playlist.
- **Phát, tạm dừng, chuyển bài**: Điều khiển nhạc với các nút Play/Pause, Next, Previous.
- **Hiển thị tên, ảnh, nghệ sĩ bài hát đang phát**.
- **Điều chỉnh âm lượng**: Thanh trượt điều chỉnh âm lượng với giao diện đẹp.
- **Thanh tiến trình**: Xem và tua vị trí phát nhạc.
- **Tạo và quản lý playlist**: Tạo nhiều playlist, thêm/xóa bài hát, chuyển đổi playlist.
- **Chỉnh tốc độ phát**: Chọn tốc độ phát nhạc (0.5x, 1x, 1.5x, 2x).
- **Tua nhanh/tua lại**: Nút tua nhanh/tua lại 10 giây.
- **Visualizer**: Hiệu ứng sóng nhạc động theo nhịp bài hát (Web Audio API).
- **Sleep Timer**: Đặt hẹn giờ tắt nhạc bằng thanh trượt hoặc preset (5, 10, 30 phút).
- **Lời bài hát (Lyrics)**: Nhập, lưu, và đồng bộ lời bài hát theo thời gian.
- **Chế độ nền tối/sáng (Dark/Light Mode)**: Chuyển đổi giao diện, lưu lựa chọn.
- **Chia sẻ bài hát qua link**: Sao chép URL chứa thông tin bài hát đang phát.
- **Thông báo đang phát nhạc**: Hiện thông báo khi chuyển bài mới (Notification API).

## Công nghệ sử dụng
- **Frontend**: HTML5, CSS3, Bootstrap 5.3, JavaScript (ES6+)
- **Audio API**: Sử dụng đối tượng `Audio` và Web Audio API cho visualizer.
- **Không sử dụng backend**: Ứng dụng chạy hoàn toàn trên frontend.

## Cấu trúc thư mục
```
Music_player_app/
├── index.html
├── scripts.js
├── README.md
├── LICENSE
├── assets/
│   ├── styles.css
│   └── images/
├── musics/
│   └── ... (file nhạc .mp3)
```

## Hướng dẫn cài đặt & sử dụng
1. **Clone hoặc tải mã nguồn về máy**
2. **Thêm file nhạc (.mp3) vào thư mục `musics/`**
3. **Chạy file `index.html` trên trình duyệt** (khuyên dùng Chrome, Edge, Firefox)
4. **Sử dụng các tính năng:**
   - Chọn bài hát hoặc playlist để phát nhạc
   - Điều chỉnh âm lượng, tua, tốc độ phát
   - Đặt hẹn giờ tắt nhạc bằng slider hoặc preset
   - Nhập/sửa lời bài hát, xem lyrics đồng bộ
   - Chuyển đổi Dark/Light Mode
   - Chia sẻ bài hát qua link

## Một số tính năng nâng cao
- **Visualizer**: Hiệu ứng sóng nhạc động, tự động thay đổi theo nhạc
- **Sleep Timer**: Đặt thời gian tắt nhạc, hiển thị đếm ngược
- **Lyrics Sync**: Lời bài hát cuộn tự động, hỗ trợ nhập và chỉnh sửa
- **Playlist đa mục**: Tạo nhiều playlist, chuyển đổi dễ dàng
- **Chia sẻ bài hát**: Link chia sẻ tự động cập nhật theo bài hát đang phát
- **Dark/Light Mode**: Giao diện đẹp, chuyển đổi mượt mà

## Tiêu chí đánh giá
- Giao diện đẹp, dễ sử dụng, responsive
- Chức năng phát nhạc ổn định, mượt mà
- Playlist và các tính năng nâng cao hoạt động tốt
- Mã nguồn rõ ràng, có chú thích

## Tác giả
- Dựa trên yêu cầu và hướng dẫn thực hành cho sinh viên học lập trình web đa phương tiện.

---

> **Lưu ý:** Ứng dụng không yêu cầu backend, không lưu trữ dữ liệu người dùng trên server. Playlist cá nhân có thể lưu tạm thời trên localStorage (nếu mở rộng).
