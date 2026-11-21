#include <stdio.h>
void dem(void) {
    int local = 0;
    static int persistent = 0;
    ++local;
    ++persistent;
    printf("local=%d; static=%d\n", local, persistent);
}
int main(void) {
    dem();
    dem();
    return 0;
}
