from pathlib import Path
import shutil

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "assets" / "chess" / "storm-commander"
FACTION_ROOT = ASSET_ROOT / "factions"
LEGACY_ROOT = ASSET_ROOT / "pieces"
SIZE = 512
SCALE = 4
CANVAS = SIZE * SCALE
INK = "#151515"

PIECES = ("king", "queen", "rook", "bishop", "knight", "pawn")
PIECE_CODES = {
    "king": "k",
    "queen": "q",
    "rook": "r",
    "bishop": "b",
    "knight": "n",
    "pawn": "p",
}

FACTIONS = {
    "pirate": {
        "name": "Pirate",
        "accent": "#ff6a00",
        "accent_dark": "#b83a00",
        "accent_light": "#ff8c00",
        "hull": "#262820",
        "hull_light": "#4b4d3e",
        "shade": "#11130f",
        "metal": "#6d6b5d",
        "glow": "#ff7a00",
    },
    "imperial": {
        "name": "Imperial",
        "accent": "#f4bd00",
        "accent_dark": "#9c6800",
        "accent_light": "#ffd86a",
        "hull": "#f4f1dc",
        "hull_light": "#ffffff",
        "shade": "#c9951a",
        "metal": "#d5a10a",
        "glow": "#ffd24a",
    },
    "robocorp": {
        "name": "Robocorp",
        "accent": "#55aaf2",
        "accent_dark": "#1f6099",
        "accent_light": "#bde8ff",
        "hull": "#b8c6ce",
        "hull_light": "#eef7f8",
        "shade": "#6d7981",
        "metal": "#7b8991",
        "glow": "#6fc7ff",
    },
    "rebel": {
        "name": "Rebel",
        "accent": "#9a70d4",
        "accent_dark": "#553287",
        "accent_light": "#dec5ff",
        "hull": "#d8cbb9",
        "hull_light": "#fff2dc",
        "shade": "#918676",
        "metal": "#77736a",
        "glow": "#c48bff",
    },
}


def faction_dominant_palette(faction, colors):
    palette = dict(colors)
    palette["trim"] = colors["hull"]
    palette["trim_light"] = colors["hull_light"]
    palette["hull"] = colors["accent"]
    palette["hull_light"] = colors["accent"]
    palette["shade"] = colors["accent_dark"]
    palette["metal"] = colors["hull"]
    if faction == "pirate":
        palette["hull"] = colors["hull"]
        palette["hull_light"] = colors["accent"]
        palette["shade"] = colors["shade"]
        palette["metal"] = colors["hull_light"]
    elif faction == "imperial":
        palette["trim"] = colors["accent_dark"]
        palette["trim_light"] = colors["accent_light"]
        palette["hull"] = colors["hull"]
        palette["hull_light"] = colors["hull_light"]
        palette["shade"] = colors["shade"]
        palette["metal"] = colors["accent"]
    return palette


def c(value):
    return tuple(int(value.lstrip("#")[index : index + 2], 16) for index in (0, 2, 4)) + (255,)


def paint(value):
    return c(value) if isinstance(value, str) and value.startswith("#") else value


def sc(value):
    return int(round(value * SCALE))


def points(values):
    return [(sc(x), sc(y)) for x, y in values]


def draw_poly(draw, values, fill, outline=INK, width=7):
    pts = points(values)
    draw.polygon(pts, fill=paint(fill))
    if outline:
        draw.line(pts + [pts[0]], fill=paint(outline), width=sc(width), joint="curve")


def draw_line(draw, values, fill=INK, width=5):
    draw.line(points(values), fill=paint(fill), width=sc(width), joint="curve")


def draw_ellipse(draw, box, fill, outline=INK, width=6):
    scaled = tuple(sc(v) for v in box)
    draw.ellipse(scaled, fill=paint(fill), outline=paint(outline) if outline else None, width=sc(width))


def draw_rect(draw, box, fill, outline=INK, width=5, radius=0):
    scaled = tuple(sc(v) for v in box)
    if radius:
        draw.rounded_rectangle(
            scaled,
            radius=sc(radius),
            fill=paint(fill),
            outline=paint(outline) if outline else None,
            width=sc(width),
        )
    else:
        draw.rectangle(scaled, fill=paint(fill), outline=paint(outline) if outline else None, width=sc(width))


def harden_alpha(image, threshold=192):
    crisp = image.convert("RGBA")
    pixels = crisp.load()
    width, height = crisp.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha < threshold:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                pixels[x, y] = (red, green, blue, 255)

    return crisp


def draw_cel_panels(draw, role, colors):
    shade = colors["shade"]
    light = colors["hull_light"]
    metal = colors["metal"]
    if role == "pawn":
        draw_poly(draw, [(257, 88), (291, 223), (278, 345), (257, 404), (257, 88)], light, outline=None)
        draw_poly(draw, [(222, 228), (236, 344), (257, 404), (257, 88)], shade, outline=None)
    elif role == "rook":
        draw_poly(draw, [(256, 96), (310, 159), (308, 383), (256, 429), (256, 96)], light, outline=None)
        draw_poly(draw, [(112, 227), (190, 190), (195, 334), (116, 357), (112, 227)], shade, outline=None)
        draw_poly(draw, [(400, 227), (322, 190), (317, 334), (396, 357), (400, 227)], metal, outline=None)
    elif role == "knight":
        draw_poly(draw, [(256, 42), (280, 196), (270, 410), (256, 454), (256, 42)], light, outline=None)
        draw_poly(draw, [(232, 154), (244, 411), (256, 454), (256, 42)], shade, outline=None)
        draw_poly(draw, [(117, 250), (218, 209), (228, 260), (147, 304)], metal, outline=None)
    elif role == "bishop":
        draw_poly(draw, [(256, 40), (302, 215), (271, 426), (256, 462), (256, 40)], light, outline=None)
        draw_poly(draw, [(211, 214), (241, 424), (256, 462), (256, 40), (232, 137)], shade, outline=None)
    elif role == "queen":
        draw_poly(draw, [(256, 62), (294, 160), (286, 405), (256, 460), (256, 62)], light, outline=None)
        draw_poly(draw, [(66, 169), (216, 121), (224, 205), (86, 249)], shade, outline=None)
        draw_poly(draw, [(446, 169), (296, 121), (288, 205), (426, 249)], metal, outline=None)
        draw_poly(draw, [(177, 316), (227, 276), (235, 383), (193, 414)], shade, outline=None)
        draw_poly(draw, [(335, 316), (285, 276), (277, 383), (319, 414)], metal, outline=None)
    elif role == "king":
        draw_poly(draw, [(256, 48), (334, 150), (313, 421), (256, 462), (256, 48)], light, outline=None)
        draw_poly(draw, [(166, 151), (235, 118), (247, 421), (193, 425)], shade, outline=None)
        draw_poly(draw, [(346, 151), (277, 118), (265, 421), (319, 425)], metal, outline=None)


def draw_greebles(draw, role, colors):
    accent = colors["accent"]
    metal = colors["metal"]
    body = colors["shade"]
    dark = colors["accent_dark"]
    glow = colors["glow"]

    if role == "pawn":
        draw_rect(draw, (232, 178, 280, 315), body, width=5, radius=10)
        draw_rect(draw, (241, 194, 271, 282), colors["hull_light"], width=4, radius=8)
        draw_ellipse(draw, (226, 316, 286, 376), accent_light(colors), width=7)
        draw_line(draw, [(213, 236), (236, 236)], width=5)
        draw_line(draw, [(276, 236), (299, 236)], width=5)
        for y in (199, 223, 247):
            draw_line(draw, [(245, y), (267, y)], dark, width=4)
    elif role == "rook":
        draw_rect(draw, (214, 122, 298, 390), body, width=5, radius=12)
        draw_rect(draw, (230, 144, 282, 248), colors["hull_light"], width=4, radius=8)
        draw_ellipse(draw, (218, 300, 294, 376), accent_light(colors), width=8)
        for x in (145, 367):
            draw_rect(draw, (x - 29, 224, x + 29, 334), accent, width=5, radius=8)
            draw_line(draw, [(x - 18, 250), (x + 18, 250)], dark, width=4)
            draw_line(draw, [(x - 18, 280), (x + 18, 280)], dark, width=4)
        for y in (171, 206, 262):
            draw_line(draw, [(232, y), (280, y)], width=4)
    elif role == "knight":
        draw_rect(draw, (231, 143, 281, 352), body, width=5, radius=14)
        draw_poly(draw, [(239, 128), (273, 128), (280, 198), (232, 198)], colors["hull_light"], width=4)
        draw_rect(draw, (239, 213, 273, 271), metal, width=4, radius=8)
        draw_ellipse(draw, (224, 330, 288, 394), accent_light(colors), width=7)
        draw_line(draw, [(139, 258), (225, 258)], width=5)
        draw_line(draw, [(287, 258), (373, 258)], width=5)
        draw_line(draw, [(239, 291), (273, 291)], dark, width=4)
    elif role == "bishop":
        draw_rect(draw, (230, 118, 282, 374), body, width=5, radius=12)
        draw_poly(draw, [(242, 74), (270, 74), (279, 154), (233, 154)], colors["hull_light"], width=4)
        draw_ellipse(draw, (221, 338, 291, 408), accent_light(colors), width=8)
        for y in (166, 202, 238, 274):
            draw_line(draw, [(236, y), (276, y)], dark, width=4)
        draw_line(draw, [(256, 58), (256, 443)], accent, width=4)
    elif role == "queen":
        draw_rect(draw, (222, 116, 290, 382), body, width=5, radius=14)
        draw_rect(draw, (231, 136, 281, 222), colors["hull_light"], width=4, radius=9)
        draw_ellipse(draw, (219, 316, 293, 390), accent_light(colors), width=8)
        draw_rect(draw, (101, 148, 208, 214), body, width=5, radius=10)
        draw_rect(draw, (304, 148, 411, 214), body, width=5, radius=10)
        for x in (143, 369):
            draw_rect(draw, (x - 27, 160, x + 27, 199), colors["hull_light"], width=4, radius=6)
            draw_ellipse(draw, (x - 15, 166, x + 15, 196), accent, width=4)
        draw_poly(draw, [(256, 72), (288, 122), (256, 111), (224, 122)], accent, width=5)
        for y in (178, 218, 258, 298):
            draw_line(draw, [(236, y), (276, y)], dark, width=4)
    elif role == "king":
        draw_rect(draw, (214, 110, 298, 384), body, width=5, radius=12)
        draw_rect(draw, (231, 136, 281, 244), colors["hull_light"], width=4, radius=8)
        draw_ellipse(draw, (213, 303, 299, 389), accent_light(colors), width=8)
        draw_poly(draw, [(256, 55), (283, 103), (256, 91), (229, 103)], accent, width=5)
        draw_rect(draw, (225, 78, 287, 112), accent, width=5, radius=8)
        draw_line(draw, [(191, 82), (191, 190)], glow, width=4)
        draw_line(draw, [(321, 82), (321, 190)], glow, width=4)
        for y in (158, 190, 222, 254):
            draw_line(draw, [(234, y), (278, y)], dark, width=4)


def accent_light(colors):
    return colors["accent_light"]


def draw_faction_marks(draw, role, faction, colors):
    accent = colors["accent"]
    dark = colors["accent_dark"]
    light = colors["accent_light"]

    if faction == "pirate":
        for offset in (-24, 0, 24):
            draw_line(draw, [(238 + offset, 125), (250 + offset, 168)], accent, width=5)
        if role in {"rook", "queen", "king"}:
            draw_poly(draw, [(166, 206), (193, 219), (168, 232)], light, outline=INK, width=4)
            draw_poly(draw, [(346, 206), (319, 219), (344, 232)], light, outline=INK, width=4)
        draw_rect(draw, (239, 386, 273, 415), dark, width=4, radius=5)
    elif faction == "imperial":
        draw_ellipse(draw, (230, 325, 282, 377), light, width=5)
        draw_poly(draw, [(256, 317), (269, 351), (256, 388), (243, 351)], accent, width=4)
        if role in {"queen", "king"}:
            draw_poly(draw, [(146, 250), (180, 224), (170, 286)], accent, width=5)
            draw_poly(draw, [(366, 250), (332, 224), (342, 286)], accent, width=5)
    elif faction == "robocorp":
        draw_line(draw, [(256, 85), (256, 416)], light, width=5)
        for x in (221, 291):
            draw_ellipse(draw, (x - 8, 219, x + 8, 235), accent, width=3)
            draw_ellipse(draw, (x - 8, 257, x + 8, 273), accent, width=3)
        if role in {"rook", "king"}:
            draw_rect(draw, (241, 118, 271, 152), accent, width=3, radius=4)
    elif faction == "rebel":
        draw_line(draw, [(214, 132), (236, 212), (223, 296)], accent, width=7)
        draw_line(draw, [(298, 132), (276, 212), (289, 296)], light, width=7)
        if role in {"bishop", "knight", "pawn"}:
            draw_poly(draw, [(194, 337), (222, 320), (210, 359)], accent, width=4)
            draw_poly(draw, [(318, 337), (290, 320), (302, 359)], accent, width=4)


def draw_engines(draw, role, colors):
    positions = {
        "pawn": [(236, 386, 276, 448)],
        "rook": [(104, 350, 142, 425), (370, 350, 408, 425), (231, 390, 281, 456)],
        "knight": [(137, 315, 169, 383), (343, 315, 375, 383), (236, 397, 276, 458)],
        "bishop": [(187, 356, 220, 428), (292, 356, 325, 428), (238, 393, 274, 462)],
        "queen": [(184, 381, 217, 444), (295, 381, 328, 444), (236, 400, 276, 464)],
        "king": [(139, 383, 179, 450), (333, 383, 373, 450), (236, 402, 276, 468)],
    }[role]
    for box in positions:
        draw_poly(
            draw,
            [
                ((box[0] + box[2]) / 2, box[3]),
                (box[0], box[1]),
                (box[2], box[1]),
            ],
            colors["metal"],
            width=5,
        )


ROLE_SHAPES = {
    "pawn": [
        ("fin", [(221, 276), (165, 322), (220, 344)]),
        ("fin", [(291, 276), (347, 322), (292, 344)]),
        ("hull", [(256, 72), (303, 213), (290, 356), (256, 430), (222, 356), (209, 213)]),
    ],
    "rook": [
        ("pod", [(72, 215), (176, 166), (202, 350), (92, 382)]),
        ("pod", [(440, 215), (336, 166), (310, 350), (420, 382)]),
        ("wing", [(141, 254), (218, 198), (226, 323), (153, 360)]),
        ("wing", [(371, 254), (294, 198), (286, 323), (359, 360)]),
        ("hull", [(256, 82), (323, 146), (317, 391), (256, 442), (195, 391), (189, 146)]),
        ("nose", [(224, 80), (288, 80), (302, 129), (210, 129)]),
    ],
    "knight": [
        ("wing", [(92, 248), (222, 204), (231, 266), (128, 322)]),
        ("wing", [(420, 248), (290, 204), (281, 266), (384, 322)]),
        ("tail", [(215, 358), (256, 328), (297, 358), (286, 425), (226, 425)]),
        ("hull", [(256, 38), (292, 152), (281, 353), (256, 456), (231, 353), (220, 152)]),
        ("nose", [(241, 36), (271, 36), (281, 99), (231, 99)]),
    ],
    "bishop": [
        ("wing", [(134, 260), (216, 178), (229, 333), (157, 394)]),
        ("wing", [(378, 260), (296, 178), (283, 333), (355, 394)]),
        ("hull", [(256, 36), (308, 219), (283, 384), (256, 464), (229, 384), (204, 219)]),
        ("spire", [(239, 72), (256, 28), (273, 72), (268, 151), (244, 151)]),
    ],
    "queen": [
        ("hammer", [(62, 150), (213, 108), (231, 202), (88, 253)]),
        ("hammer", [(450, 150), (299, 108), (281, 202), (424, 253)]),
        ("wing", [(151, 286), (227, 239), (238, 382), (180, 425)]),
        ("wing", [(361, 286), (285, 239), (274, 382), (332, 425)]),
        ("hull", [(256, 47), (304, 137), (294, 395), (256, 466), (218, 395), (208, 137)]),
        ("crown", [(205, 110), (230, 74), (256, 101), (282, 74), (307, 110), (286, 139), (226, 139)]),
    ],
    "king": [
        ("wing", [(94, 220), (188, 134), (222, 414), (141, 434)]),
        ("wing", [(418, 220), (324, 134), (290, 414), (371, 434)]),
        ("pod", [(145, 290), (200, 262), (215, 390), (158, 421)]),
        ("pod", [(367, 290), (312, 262), (297, 390), (354, 421)]),
        ("hull", [(256, 40), (346, 150), (324, 426), (256, 468), (188, 426), (166, 150)]),
        ("bridge", [(210, 98), (256, 47), (302, 98), (287, 136), (225, 136)]),
    ],
}


def draw_role(draw, role, faction, colors):
    for part, values in ROLE_SHAPES[role]:
        if part in {"crown", "bridge", "nose", "spire"}:
            fill = colors["accent"]
        elif part == "hammer":
            fill = colors["hull"]
        elif part in {"pod", "fin", "tail"}:
            fill = colors["metal"] if faction != "pirate" else colors["hull"]
        else:
            fill = colors["hull"]
        draw_poly(draw, values, fill, width=8 if part == "hull" else 7)

    draw_cel_panels(draw, role, colors)
    draw_faction_marks(draw, role, faction, colors)
    draw_greebles(draw, role, colors)
    draw_engines(draw, role, colors)

    # Reassert a crisp center spine and a few Glave-style panel seams.
    draw_line(draw, [(256, 72), (256, 430)], INK, width=4)
    if role != "pawn":
        draw_line(draw, [(207, 188), (236, 216)], INK, width=3)
        draw_line(draw, [(305, 188), (276, 216)], INK, width=3)
    for y in (212, 245, 278):
        draw_line(draw, [(238, y), (274, y)], INK, width=3)


def render_ship(faction, role):
    colors = faction_dominant_palette(faction, FACTIONS[faction])
    image = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw_role(draw, role, faction, colors)
    image = image.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    return harden_alpha(image)


def assert_crisp_ship_alpha(image, faction, role):
    pixels = image.load()
    width, height = image.size
    seen = set()
    largest_size = 0
    largest_box = None
    partial_alpha_count = 0

    def looks_like_shadow_edge(x, y):
        red, green, blue, alpha = pixels[x, y]
        return 8 <= alpha < 180 and max(red, green, blue) < 95

    for y in range(height):
        for x in range(width):
            alpha = pixels[x, y][3]
            if 0 < alpha < 255:
                partial_alpha_count += 1
            if (x, y) in seen or not looks_like_shadow_edge(x, y):
                continue

            stack = [(x, y)]
            seen.add((x, y))
            xs = []
            ys = []

            while stack:
                cx, cy = stack.pop()
                xs.append(cx)
                ys.append(cy)

                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if (
                        0 <= nx < width
                        and 0 <= ny < height
                        and (nx, ny) not in seen
                        and looks_like_shadow_edge(nx, ny)
                    ):
                        seen.add((nx, ny))
                        stack.append((nx, ny))

            component_size = len(xs)
            if component_size > largest_size:
                largest_size = component_size
                largest_box = (min(xs), min(ys), max(xs), max(ys))

    if largest_size > 900:
        raise ValueError(
            f"{faction}/{role} has a large semi-transparent dark blob "
            f"({largest_size} px at {largest_box}); baked shadows are not allowed."
        )
    if partial_alpha_count:
        raise ValueError(
            f"{faction}/{role} has {partial_alpha_count} partial-alpha pixels; "
            "ship PNGs must use crisp transparent cutouts."
        )


def build_assets():
    generated = {}
    for faction in FACTIONS:
        out_dir = FACTION_ROOT / faction
        out_dir.mkdir(parents=True, exist_ok=True)
        generated[faction] = {}
        for role in PIECES:
            image = render_ship(faction, role)
            assert_crisp_ship_alpha(image, faction, role)
            path = out_dir / f"{role}.png"
            image.save(path)
            generated[faction][role] = path

    # Keep the current game-facing two-side filenames working. The default matchup
    # is clean Robocorp ships against darker Pirate ships.
    LEGACY_ROOT.mkdir(parents=True, exist_ok=True)
    for color, faction in (("white", "robocorp"), ("black", "pirate")):
        for role in PIECES:
            shutil.copyfile(generated[faction][role], LEGACY_ROOT / f"{color}-{role}.png")

    build_preview_sheet(generated)


def build_preview_sheet(generated):
    tile = 124
    gap = 16
    label_h = 58
    header_h = 122
    side_w = 142
    width = side_w + len(PIECES) * tile + (len(PIECES) + 1) * gap
    height = header_h + len(FACTIONS) * (tile + label_h) + (len(FACTIONS) + 1) * gap
    sheet = Image.new("RGBA", (width, height), c("#f7f8f3"))
    draw = ImageDraw.Draw(sheet)

    try:
        title_font = ImageFont.truetype("arial.ttf", 30)
        label_font = ImageFont.truetype("arial.ttf", 18)
        small_font = ImageFont.truetype("arial.ttf", 15)
    except OSError:
        title_font = ImageFont.load_default()
        label_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    draw.text((24, 22), "Storm Commander Faction Ship Pieces", fill=c("#22252a"), font=title_font)
    draw.text(
        (24, 62),
        "Cel-shaded top-down ships: faction color dominates, metal reads as trim.",
        fill=c("#68737a"),
        font=small_font,
    )

    for col, role in enumerate(PIECES):
        x = side_w + gap + col * (tile + gap)
        draw.text((x + 10, header_h - 34), role.title(), fill=c("#22252a"), font=small_font)

    for row, (faction, base_colors) in enumerate(FACTIONS.items()):
        colors = faction_dominant_palette(faction, base_colors)
        y = header_h + gap + row * (tile + label_h + gap)
        draw.text((24, y + 36), colors["name"], fill=c(colors["accent"]), font=label_font)
        draw.rectangle((24, y + 64, 104, y + 74), fill=c(colors["accent"]))
        draw.rectangle((24, y + 78, 104, y + 88), fill=c(colors["metal"]))
        for col, role in enumerate(PIECES):
            x = side_w + gap + col * (tile + gap)
            draw.rounded_rectangle((x, y, x + tile, y + tile), radius=10, fill=c("#e9ece4"), outline=c("#d8ded4"), width=2)
            image = Image.open(generated[faction][role]).convert("RGBA")
            image.thumbnail((tile - 12, tile - 12), Image.Resampling.LANCZOS)
            image = harden_alpha(image, threshold=128)
            sheet.alpha_composite(image, (x + (tile - image.width) // 2, y + (tile - image.height) // 2))

    sheet.save(FACTION_ROOT / "preview-sheet.png")


if __name__ == "__main__":
    build_assets()
