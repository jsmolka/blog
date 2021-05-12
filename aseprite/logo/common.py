import argparse
import re


def parse(fname):
    pixels = {}
    with open(fname, "r") as svg:
        for line in svg:
            x = re.search(r"x=\" ?(\d+)\"", line)
            y = re.search(r"y=\" ?(\d+)\"", line)
            c = re.search(r"fill=\"#([0-9A-F]+)\"", line)

            if x and y and c:
                x = int(x.group(1))
                y = int(y.group(1))

                pixels[(x, y)] = c.group(1)

    return pixels


def io_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", dest="ifname", type=str, help="input filename", required=True)
    parser.add_argument("-o", dest="ofname", type=str, help="output filename", required=True)

    return parser.parse_args()
