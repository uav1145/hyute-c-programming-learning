#include <stdio.h>
int main(void) {
    int n = 7, tong = 0;
    for (int i = 1; i <= n; ++i) {
        if (i % 2 != 0) {
            tong += i;
        }
    }
    printf("Tong le = %d\n", tong);
    return 0;
}
