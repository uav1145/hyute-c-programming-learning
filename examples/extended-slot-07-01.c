#include <stdio.h>
int main(void) {
    int i = 1, sum = 0;
    while (i <= 4) {
        sum += i;
        ++i;
    }
    printf("Tong = %d\n", sum);
    return 0;
}
