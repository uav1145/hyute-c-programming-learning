#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "ABC";
    printf("sizeof=%zu strlen=%zu\n", sizeof s, strlen(s));
    for (size_t i = 0; i < sizeof s; ++i)
        printf("byte[%zu]=%u\n", i, (unsigned)(unsigned char)s[i]);
    return 0;
}
