#include <stdio.h>
int main(void) {
    int so_luong = 12;
    double don_gia = 3.5;
    double tong = so_luong * don_gia;
    printf("Tong = %.2f\n", tong);
    printf("sizeof(int) = %zu byte\n", sizeof(int));
    return 0;
}
