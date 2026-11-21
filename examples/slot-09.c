#include <stdio.h>
void tang(int x) { x = x + 1; printf("Trong ham: %d\n", x); }
int main(void) {
    int n = 5;
    tang(n);
    printf("Trong main: %d\n", n);
    return 0;
}
