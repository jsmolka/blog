import common
import collections

SVG = """<?xml version="1.0" encoding="UTF-8" ?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 {0} {0}" width="{0}" height="{0}" shape-rendering="crispEdges">
  {1}
</svg>
"""


def make_line(x, y, width):
    return "M{} {}h{}".format(x, y, width)


def make_path(color, path):
    return "<path stroke=\"#{}\" d=\"{}\" />".format(color, path)


def make_grid(pixels, size):
    grid = [[None] * size for _ in range(size)]

    for (x, y), value in pixels.items():
        grid[y][x] = value

    return grid


def optimize(grid):
    paths = collections.defaultdict(str)

    for y, row in enumerate(grid):
        color = row[0]
        start = 0
        width = 1

        for x in range(1, len(row)):
            if row[x] == color:
                width += 1
            else:
                paths[color] += make_line(start, y, width)
                color = row[x]
                start = x
                width = 1

        paths[color] += make_line(start, y, width)

    del paths[None]

    return paths


def build(fname, paths, size):
    lines = (make_path(color, path) for color, path in paths.items())

    with open(fname, "w") as svg:
        svg.write(SVG.format(size, "\n  ".join(lines)))


def main(args):
    pixels = common.parse(args.ifname)

    size = max(max(pixels.keys())) + 1
    grid = make_grid(pixels, size)

    paths = optimize(grid)
    build(args.ofname, paths, size)


if __name__ == "__main__":
    main(common.io_args())
