#include <stdio.h>
int main(void) {
    int a = 12, b = 0;
    if (b != 0 && a / b > 2) {
        puts("Lon hon 2");
    } else {
        puts("Khong chia khi b bang 0");
    }
    unsigned x = 5U;
    printf("5 & 3 = %u\n", x & 3U);
    return 0;
}
