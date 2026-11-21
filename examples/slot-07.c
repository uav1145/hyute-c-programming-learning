#include <stdio.h>
int main(void) {
    int n;
    long long tong = 0;
    if (scanf("%d", &n) != 1 || n < 0 || n > 1000000) {
        puts("n khong hop le"); return 1;
    }
    for (int i = 1; i <= n; ++i) {
        tong += i;
    }
    printf("Tong = %lld\n", tong);
    return 0;
}
