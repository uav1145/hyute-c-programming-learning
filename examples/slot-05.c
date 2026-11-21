#include <stdio.h>
int main(void) {
    int x;
    if (scanf("%d", &x) != 1) return 1;
    if (x < 0) {
        printf("So am\n");
    } else {
        printf("So khong am\n");
    }
    return 0;
}
