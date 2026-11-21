#include <stdio.h>
#include <limits.h>
#include <float.h>
int main(void) {
    printf("CHAR_BIT=%d\n", CHAR_BIT);
    printf("INT_MAX=%d\n", INT_MAX);
    printf("sizeof(double)=%zu\n", sizeof(double));
    printf("FLT_DIG=%d\n", FLT_DIG);
    return 0;
}
