---
title: "Showcase"
date: "2019-01-18"
author: "Lorem Ipsum"
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec interdum metus. Aenean rutrum ligula sodales ex auctor, sed tempus dui mollis. Curabitur ipsum dui, aliquet nec commodo at, tristique eget ante. **Donec quis dolor nec nunc mollis interdum vel in purus**. Sed vitae leo scelerisque, sollicitudin elit sed, congue ante. In augue nisl, vestibulum commodo est a, tristique porttitor est. Proin laoreet iaculis ornare. Nullam ut neque quam.

> Fusce pharetra suscipit orci nec tempor. Quisque vitae sem sit amet sem mollis consequat. Sed at imperdiet lorem. Vestibulum pharetra faucibus odio, ac feugiat tellus sollicitudin at. Pellentesque varius tristique mi imperdiet dapibus. Duis orci odio, sodales lacinia venenatis sit amet, feugiat et diam.

### Header 3

Nulla libero turpis, lacinia vitae cursus ut, auctor dictum nisl. Fusce varius felis nec sem ullamcorper, at convallis nisi vestibulum. Duis risus odio, porta sit amet placerat mollis, tincidunt non mauris. Suspendisse fringilla, `odio a dignissim pharetra`, est urna sollicitudin urna, eu scelerisque magna ex vitae tellus.

```cpp
void insert(Event& item) {
  Event*  node = &item;
  Event** iter = &head;

  while (**iter < *node)
    iter = &(*iter)->next;

  node->prev = (*iter)->prev;
  node->next = (*iter);
  node->prev->next = node;
  node->next->prev = node;

  *iter = node;
}
```

{{<table>}}
| Test           | eggvance 0.1 | eggvance 0.2 | eggvance 0.3 | eggvance 1.0 | Total |
|:---------------|:-------------|:-------------|:-------------|:-------------|:------|
| Memory         | 1452         | 1456         | 1552         | 1552         | 1552  |
| Timing         | 457          | 404          | 1496         | 1496         | 1660  |
| DMA            | 1048         | 1048         | 1220         | 1256         | 1256  |
| Timer count-up | 356          | 365          | 496          | 496          | 936   |
| Shifter        | 139          | 140          | 140          | 140          | 140   |
| I/O read       | 123          | 123          | 123          | 123          | 123   |
| Carry          | 93           | 93           | 93           | 93           | 93    |
| Timer IRQ      | 0            | 28           | 65           | 65           | 90    |
| Multiply long  | 52           | 52           | 52           | 52           | 72    |
| Edge case      | 1            | 1            | 2            | 6            | 10    |
{{</table>}}

### Header

Note [^1]

Note [^2]

[I am a link]()

Curabitur scelerisque felis viverra varius scelerisque. Ut enim libero, molestie gravida blandit at, mollis ornare tellus. Cras arcu mi, ultrices vel pulvinar vel, volutpat eu tortor. Nullam nec eros quis massa ultrices iaculis sed in metus. Praesent sollicitudin sem sit amet orci tempor gravida.

- Maecenas elementum vitae nibh vitae porttitor.
- Aenean consequat, risus ut cursus placerat, arcu nulla sodales risus, ut molestie tellus tellus et dui.
- Integer imperdiet turpis vitae lacus imperdiet, ut ornare ligula auctor. Integer in mi eu velit vehicula suscipit eget vulputate nulla.
- Etiam vitae enim quis velit lobortis placerat a ut sem.
  - Curabitur lobortis ante sit amet orci pulvinar, sollicitudin viverra nunc accumsan.
  - Praesent fermentum orci quis leo facilisis posuere.

Aliquam erat volutpat. In hac habitasse platea dictumst. Nunc ut tincidunt mauris. Sed at gravida risus, id semper magna. Nullam vitae enim mattis, sodales neque non, pharetra elit. Cras sit amet sagittis augue, et finibus turpis. Ut tempus tincidunt diam vel pharetra. Nulla porttitor odio sit amet nulla scelerisque, quis aliquam mi imperdiet. Sed tincidunt dui vel tellus vestibulum rhoncus. Donec tempus ultrices velit.

### Notes
[^1]: Curabitur scelerisque felis viverra varius scelerisque. Ut enim libero, molestie gravida blandit at, mollis ornare tellus. Cras arcu mi, ultrices vel pulvinar vel, volutpat eu tortor. Nullam nec eros quis massa ultrices iaculis sed in metus. Praesent sollicitudin sem sit amet orci tempor gravida.

[^2]: Aliquam erat volutpat. In hac habitasse platea dictumst. Nunc ut tincidunt mauris. Sed at gravida risus, id semper magna. Nullam vitae enim mattis, sodales neque non, pharetra elit. Cras sit amet sagittis augue, et finibus turpis. Ut tempus tincidunt diam vel pharetra. Nulla porttitor odio sit amet nulla scelerisque, quis aliquam mi imperdiet. Sed tincidunt dui vel tellus vestibulum rhoncus. Donec tempus ultrices velit.
