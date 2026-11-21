#include <stdio.h>
unsigned long long gt(unsigned n) {
    if (n <= 1U) return 1ULL;
    return (unsigned long long)n * gt(n - 1U);
}
int main(void) {
    unsigned n = 5;
    printf("Giai thua = %llu\n", gt(n));
    return 0;
}
