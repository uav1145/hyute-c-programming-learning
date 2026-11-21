#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <ctype.h>
#include <limits.h>
#include <string.h>
int main(void) {
    char s[] = "  42  ";
    errno = 0;
    char *end;
    long x = strtol(s, &end, 10);
    while (isspace((unsigned char)*end)) ++end;
    if (end == s || *end != '\0' || errno == ERANGE || x < INT_MIN || x > INT_MAX)
        puts("Khong hop le");
    else printf("So hop le=%ld\n", x);
    return 0;
}
