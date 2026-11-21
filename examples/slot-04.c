#include <stdio.h>
int main(void) {
    int tong = 17, so_bai = 4;
    printf("Chia nguyen: %d\n", tong / so_bai);
    printf("Chia thuc: %.2f\n", (double)tong / so_bai);
    printf("Du: %d\n", tong % so_bai);
    return 0;
}
