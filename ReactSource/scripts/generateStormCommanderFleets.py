from pathlib import Path
import shutil

from PIL import Image, ImageDraw, ImageFilter, ImageFont


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
        "accent_light": "#ffca28",
        "hull": "#c58b00",
        "hull_light": "#d9a200",
        "shade": "#6f4b00",
        "metal": "#c9951a",
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
        palette["hull"] = colors["accent"]
        palette["hull_light"] = colors["accent_light"]
        palette["shade"] = colors["accent_dark"]
        palette["metal"] = colors["hull"]
    return palette


def c(value):
    return tuple(int(value.lstrip("#")[index : index + 2], 16) for index in (0, 2, 4)) + (255,)


def sc(value):
    return int(round(value * SCALE))


def points(values):
    return [(sc(x), sc(y)) for x, y in values]


def draw_poly(draw, values, fill, outline=INK, width=7):
    pts = points(values)
    draw.polygon(pts, fill=c(fill) if isinstance(fill, str) and fill.startswith("#") else fill)
    if outline:
        draw.line(pts + [pts[0]], fill=c(outline), width=sc(width), joint="curve")


def draw_line(draw, values, fill=INK, width=5):
    draw.line(points(values), fill=c(fill), width=sc(width), joint="curve")


def draw_ellipse(draw, box, fill, outline=INK, width=6):
    scaled = tuple(sc(v) for v in box)
    draw.ellipse(scaled, fill=c(fill), outline=c(outline) if outline else None, width=sc(width))


def draw_rect(draw, box, fill, outline=INK, width=5, radius=0):
    scaled = tuple(sc(v) for v in box)
    if radius:
        draw.rounded_rectangle(
            scaled,
            radius=sc(radius),
            fill=c(fill),
            outline=c(outline) if outline else None,
            width=sc(width),
        )
    else:
        draw.rectangle(scaled, fill=c(fill), outline=c(outline) if outline else None, width=sc(width))


def draw_shadow(base, role):
    shadow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    if role in {"king", "queen"}:
        box = (88, 110, 424, 452)
    elif role == "rook":
        box = (58, 142, 454, 412)
    elif role == "bishop":
        box = (130, 62, 382, 460)
    elif role == "knight":
        box = (78, 96, 434, 446)
    else:
        box = (136, 122, 376, 432)
    draw.ellipse(tuple(sc(v) for v in box), fill=(0, 0, 0, 92))
    shadow = shadow.filter(ImageFilter.GaussianBlur(sc(11)))
    base.alpha_composite(shadow, (0, sc(16)))


def draw_cel_panels(draw, role, colors):
    shade = colors["shade"]
    light = colors["hull_light"]
    if role == "pawn":
        draw_poly(draw, [(257, 82), (306, 222), (287, 345), (257, 400), (257, 82)], light, outline=None)
        draw_poly(draw, [(197, 224), (223, 340), (257, 400), (257, 82)], shade, outline=None)
    elif role == "rook":
        draw_poly(draw, [(256, 92), (320, 158), (323, 384), (256, 428), (256, 92)], light, outline=None)
        draw_poly(draw, [(78, 229), (187, 174), (201, 337), (87, 366), (78, 229)], shade, outline=None)
        draw_poly(draw, [(434, 229), (325, 174), (311, 337), (425, 366), (434, 229)], colors["hull_light"], outline=None)
    elif role == "knight":
        draw_poly(draw, [(256, 72), (322, 235), (256, 438), (256, 72)], light, outline=None)
        draw_poly(draw, [(92, 280), (223, 177), (256, 438), (188, 360)], shade, outline=None)
    elif role == "bishop":
        draw_poly(draw, [(256, 48), (307, 230), (256, 458), (256, 48)], light, outline=None)
        draw_poly(draw, [(204, 230), (256, 458), (256, 48), (226, 138)], shade, outline=None)
    elif role == "queen":
        draw_poly(draw, [(256, 60), (340, 154), (318, 404), (256, 452), (256, 60)], light, outline=None)
        draw_poly(draw, [(105, 258), (191, 156), (223, 407), (128, 395)], shade, outline=None)
        draw_poly(draw, [(407, 258), (321, 156), (289, 407), (384, 395)], colors["hull_light"], outline=None)
    elif role == "king":
        draw_poly(draw, [(256, 50), (336, 164), (320, 424), (256, 458), (256, 50)], light, outline=None)
        draw_poly(draw, [(170, 158), (236, 118), (256, 458), (195, 421)], shade, outline=None)


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
        draw_rect(draw, (226, 154, 286, 340), body, width=5, radius=10)
        draw_poly(draw, [(236, 174), (276, 174), (270, 257), (242, 257)], colors["hull_light"], width=4)
        draw_ellipse(draw, (221, 332, 291, 402), accent_light(colors), width=8)
        draw_line(draw, [(200, 263), (237, 263)], width=5)
        draw_line(draw, [(276, 236), (321, 236)], width=5)
        draw_line(draw, [(238, 287), (275, 287)], dark, width=4)
    elif role == "bishop":
        draw_rect(draw, (230, 118, 282, 374), body, width=5, radius=12)
        draw_poly(draw, [(242, 74), (270, 74), (279, 154), (233, 154)], colors["hull_light"], width=4)
        draw_ellipse(draw, (221, 338, 291, 408), accent_light(colors), width=8)
        for y in (166, 202, 238, 274):
            draw_line(draw, [(236, y), (276, y)], dark, width=4)
        draw_line(draw, [(256, 58), (256, 443)], accent, width=4)
    elif role == "queen":
        draw_rect(draw, (217, 116, 295, 375), body, width=5, radius=12)
        draw_ellipse(draw, (214, 298, 298, 382), accent_light(colors), width=8)
        draw_poly(draw, [(256, 77), (286, 132), (256, 116), (226, 132)], accent, width=5)
        for x in (168, 344):
            draw_ellipse(draw, (x - 36, 254, x + 36, 326), colors["hull_light"], width=5)
            draw_ellipse(draw, (x - 17, 273, x + 17, 307), accent, width=4)
        for y in (157, 192, 228, 264):
            draw_line(draw, [(234, y), (278, y)], dark, width=4)
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
    accent = colors["glow"]
    positions = {
        "pawn": [(224, 386, 248, 437), (264, 386, 288, 437)],
        "rook": [(118, 361, 151, 429), (361, 361, 394, 429), (234, 391, 278, 450)],
        "knight": [(173, 358, 204, 426), (308, 358, 339, 426), (238, 390, 274, 452)],
        "bishop": [(190, 356, 221, 428), (291, 356, 322, 428), (240, 393, 272, 462)],
        "queen": [(112, 379, 145, 442), (367, 379, 400, 442), (238, 400, 274, 462)],
        "king": [(150, 383, 184, 448), (328, 383, 362, 448), (238, 402, 274, 466)],
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
        draw_poly(
            draw,
            [
                ((box[0] + box[2]) / 2, box[3] + 17),
                (box[0] + 7, box[3] - 3),
                (box[2] - 7, box[3] - 3),
            ],
            accent,
            outline=None,
        )


ROLE_SHAPES = {
    "pawn": [
        ("wing", [(176, 252), (102, 314), (194, 342), (214, 292)]),
        ("wing", [(336, 252), (410, 314), (318, 342), (298, 292)]),
        ("hull", [(256, 64), (315, 205), (300, 346), (256, 430), (212, 346), (197, 205)]),
    ],
    "rook": [
        ("wing", [(70, 226), (184, 166), (202, 326), (86, 370)]),
        ("wing", [(442, 226), (328, 166), (310, 326), (426, 370)]),
        ("hull", [(256, 82), (320, 145), (318, 388), (256, 438), (194, 388), (192, 145)]),
        ("nose", [(226, 82), (286, 82), (300, 127), (212, 127)]),
    ],
    "knight": [
        ("wing", [(92, 276), (220, 152), (239, 298), (188, 373)]),
        ("wing", [(420, 214), (296, 157), (278, 317), (363, 358)]),
        ("hull", [(256, 58), (323, 232), (288, 345), (256, 448), (224, 345), (189, 232)]),
    ],
    "bishop": [
        ("wing", [(152, 260), (216, 189), (230, 334), (166, 382)]),
        ("wing", [(360, 260), (296, 189), (282, 334), (346, 382)]),
        ("hull", [(256, 38), (307, 223), (284, 380), (256, 462), (228, 380), (205, 223)]),
    ],
    "queen": [
        ("wing", [(78, 254), (188, 145), (224, 404), (126, 408)]),
        ("wing", [(434, 254), (324, 145), (288, 404), (386, 408)]),
        ("hull", [(256, 48), (337, 141), (319, 401), (256, 462), (193, 401), (175, 141)]),
        ("crown", [(209, 97), (234, 59), (256, 96), (278, 59), (303, 97), (285, 125), (227, 125)]),
    ],
    "king": [
        ("wing", [(102, 226), (190, 137), (221, 412), (146, 428)]),
        ("wing", [(410, 226), (322, 137), (291, 412), (366, 428)]),
        ("hull", [(256, 42), (344, 152), (323, 423), (256, 466), (189, 423), (168, 152)]),
        ("bridge", [(210, 97), (256, 48), (302, 97), (287, 134), (225, 134)]),
    ],
}


def draw_role(draw, role, faction, colors):
    for part, values in ROLE_SHAPES[role]:
        if part == "wing":
            fill = colors["hull"] if faction != "pirate" else colors["shade"]
        elif part in {"crown", "bridge", "nose"}:
            fill = colors["accent"]
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
    draw_shadow(image, role)
    draw = ImageDraw.Draw(image)
    draw_role(draw, role, faction, colors)
    image = image.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    return image


def build_assets():
    generated = {}
    for faction in FACTIONS:
        out_dir = FACTION_ROOT / faction
        out_dir.mkdir(parents=True, exist_ok=True)
        generated[faction] = {}
        for role in PIECES:
            image = render_ship(faction, role)
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
            sheet.alpha_composite(image, (x + (tile - image.width) // 2, y + (tile - image.height) // 2))

    sheet.save(FACTION_ROOT / "preview-sheet.png")


if __name__ == "__main__":
    build_assets()
