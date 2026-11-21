#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <ctype.h>
#include <limits.h>
#include <string.h>

/* Tra ve 1 neu doc dung mot so nguyen trong [min, max]. */
static int read_int_range(int min, int max, int *value) {
    char line[100];
    if (fgets(line, sizeof line, stdin) == NULL) return 0;
    /* Neu chua co newline, doc them mot ky tu de phat hien phan du. */
    if (strchr(line, '\n') == NULL) {
        int c = getchar();
        if (c != EOF) {
            while (c != '\n' && c != EOF) c = getchar();
            return 0;
        }
    }
    errno = 0;
    char *end = NULL;
    char *begin = line;
    long x = strtol(begin, &end, 10);
    if (begin == end || errno == ERANGE) return 0;
    while (isspace((unsigned char)*end)) ++end;
    if (*end != '\0' || x < min || x > max ||
        x < INT_MIN || x > INT_MAX) return 0;
    *value = (int)x;
    return 1;
}
int main(void) {
    int n;
    puts("Nhap so nguyen 1..100:");
    if (!read_int_range(1, 100, &n)) {
        puts("Du lieu khong hop le");
        return 1;
    }
    printf("Gia tri = %d\n", n);
    return 0;
}
