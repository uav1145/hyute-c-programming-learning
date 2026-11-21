#include <stdio.h>
int main(void) {
    int a[] = {4, 7, 2, 9};
    size_t n = sizeof a / sizeof a[0];
    int tong = 0;
    for (size_t i = 0; i < n; ++i) tong += a[i];
    printf("Tong = %d\n", tong);
    printf("TB = %.2f\n", (double)tong / n);
    return 0;
}
