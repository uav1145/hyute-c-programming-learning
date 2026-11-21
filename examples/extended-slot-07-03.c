#include <stdio.h>
int main(void) {
    int tong = 0;
    for (int i = 1; i <= 8; ++i) {
        if (i % 2 != 0) continue;
        tong += i;
    }
    printf("Tong chan = %d\n", tong);
    return 0;
}
