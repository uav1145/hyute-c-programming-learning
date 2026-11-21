#include <stdio.h>
struct Student { int id; double score; };
int main(void) {
    struct Student s = {101, 8.5};
    struct Student *p = &s;
    p->score = 9.0;
    printf("ID=%d Diem=%.1f\n", s.id, s.score);
    return 0;
}
