#include <stdio.h>
int main(void) {
    int menu;
    if (scanf("%d", &menu) != 1) { puts("Nhap sai"); return 1; }
    switch (menu) {
        case 1: puts("Xem diem"); break;
        case 2: puts("Sua diem"); break;
        case 3: puts("Thoat"); break;
        default: puts("Lua chon khong ton tai");
    }
    return 0;
}
