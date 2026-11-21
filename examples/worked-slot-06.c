#include <stdio.h>
int main(void) {
    double tong = 500.0;
    double giam = 0.0;
    if (tong >= 500.0) {
        giam = 0.10;
    }
    printf("Phai tra = %.2f\n", tong * (1.0 - giam));
    return 0;
}
