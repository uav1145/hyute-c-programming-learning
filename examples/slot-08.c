#include <stdio.h>
int gcd(int a, int b);
int main(void) {
    int a = 24, b = 18;
    printf("UCLN = %d\n", gcd(a, b));
    return 0;
}
int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}
