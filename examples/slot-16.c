#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "UTEHY";
    printf("Chuoi: %s\n", s);
    printf("Do dai: %zu\n", strlen(s));
    printf("Kich thuoc mang: %zu\n", sizeof s);
    return 0;
}
