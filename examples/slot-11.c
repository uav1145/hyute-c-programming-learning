#include <stdio.h>
#include <ctype.h>
#include <math.h>
int main(void) {
    unsigned char ky_tu = '7';
    double x = 81.0;
    printf("La chu so: %d\n", isdigit(ky_tu) != 0);
    printf("Can bac hai: %.1f\n", sqrt(x));
    return 0;
}
