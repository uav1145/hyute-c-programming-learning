#include <stdio.h>
#include <ctype.h>
int main(void) {
    char c = '7';
    if (isdigit((unsigned char)c)) {
        puts("La chu so");
    } else {
        puts("Khong phai chu so");
    }
    return 0;
}
