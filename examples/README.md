# Mã ví dụ lập trình C căn bản – PRF192

Có tổng cộng **68 tệp mã nguồn C độc lập**:

- `slot-00.c` … `slot-20.c`: 21 ví dụ minh họa chính.
- `worked-slot-00.c` … `worked-slot-20.c`: 21 bài tập mẫu có lời giải.
- `extended-slot-NN-MM.c`: 26 chương trình mở rộng, minh họa các cơ chế còn thiếu của từng bài.

Mã ở đây được đồng bộ với `data/course.json` và được kiểm tra bằng `tests/validate.py`.

Biên dịch (ví dụ Slot 07):

```sh
gcc -std=c11 -Wall -Wextra -Wpedantic slot-07.c -o slot-07
./slot-07 < inputs/slot-07.txt
```

Một số ví dụ dùng `math.h` cần thêm `-lm` trên GCC/Linux. Ví dụ về tệp sẽ tạo các tệp dữ liệu trong thư mục làm việc.

Khi dùng OnlineGDB, sao chép mã trong HTML hoặc trong các tệp này vào `main.c`, chọn ngôn ngữ C, nhập dữ liệu từ tệp mẫu hoặc ô Standard Input rồi chọn Run.

Không phụ thuộc vào thư viện ngoài chuẩn C.

Chương trình dùng tệp có thể tạo tệp dữ liệu thử trong thư mục làm việc, nên hãy chạy trong thư mục dành riêng cho bài thực hành và không sử dụng tên tệp thật đang chứa dữ liệu quan trọng.
