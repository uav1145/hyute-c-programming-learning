#include <stdio.h>
int main(void) {
    int a, b;
    printf("Nhap a b: ");
    if (scanf("%d %d", &a, &b) != 2) {
        puts("Du lieu khong hop le");
        return 1;
    }
    printf("Tong = %d\n", a + b);
    return 0;
}
