import json
import matplotlib.pyplot as plt

plt.rcParams["font.family"] = "Inter"

PLOT_SIZE = (19.2, 10.8)
PLOT_DPI = 100
COLOR_SHADE_1 = "#ebedf2"
COLOR_BRAND_3 = "#608fb3"
WINDOW = 125


def load():
    with open("./offset-distribution.json") as f:
        data = json.load(f)

    drop = [0]
    counts = {offset: count for offset, count in data if offset not in drop}
    offsets = [offset for offset in range(-WINDOW, WINDOW + 1) if offset not in drop]
    values = [counts.get(offset, 0) for offset in offsets]

    return offsets, values


def main():
    offsets, values = load()

    _, axes = plt.subplots(figsize=PLOT_SIZE)
    axes.plot(offsets, values, color=COLOR_BRAND_3, linewidth=4)
    axes.fill_between(offsets, values, color=COLOR_BRAND_3, alpha=0.2)

    axes.set_xlim(-WINDOW, WINDOW)
    axes.set_ylim(bottom=0)
    axes.tick_params(colors=COLOR_SHADE_1, length=8, labelsize=24)

    for spine in axes.spines.values():
        spine.set_edgecolor(COLOR_SHADE_1)

    plt.tight_layout()
    plt.savefig("../../img/offset-distribution.png", dpi=PLOT_DPI, transparent=True)


if __name__ == "__main__":
    main()
