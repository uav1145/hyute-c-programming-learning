#include <stdio.h>
int main(void) {
    unsigned int n = 12040U;
    unsigned int count = 0U;
    do { ++count; n /= 10U; } while (n > 0U);
    printf("So chu so = %u\n", count);
    return 0;
}
