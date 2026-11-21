#include <stdio.h>
#include <stdlib.h>
int main(void) {
    size_t n = 4;
    int *a = malloc(n * sizeof *a);
    if (a == NULL) {
        puts("Khong du bo nho");
        return 1;
    }
    for (size_t i = 0; i < n; ++i) a[i] = (int)(2 * (i + 1));
    int tong = 0;
    for (size_t i = 0; i < n; ++i) tong += a[i];
    printf("Trung binh = %.2f\n", (double)tong / n);
    free(a);
    return 0;
}
