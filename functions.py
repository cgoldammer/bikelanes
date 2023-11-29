import math
import mercantile, mapbox_vector_tile, requests, json
from vt2geojson.tools import vt_bytes_to_geojson
import os
from pyproj import Geod
import warnings
from PIL import Image

import json
import pandas as pd
import json
import shapely
from shapely.geometry import LineString, Point
import numpy as np

from mapboxgl.utils import *
from mapboxgl.viz import *

import geopandas as gpd

from pyproj import CRS
crs = CRS(proj='utm', zone=18, ellps='WGS84')
crs_geo = 'EPSG:4326'

access_token_mapillary = os.environ['MAPILLARY_ACCESS_TOKEN']

distance_max = 3.e-04
folder_name = 'images'
BORO_MANHATTAN = 1
filename_routes = 'data/nyc_bikeroutes.geojson'

lanes_dict = {
    0: 'None',
    1: 'Sharrows',
    2: 'Standard',
    3: 'Protected Path',
    4: 'Greenway'
}

# Invert the dictionary
lanes_dict_inv = {v:k for k,v in lanes_dict.items()}
cols_lanes = ['tf', 'ft']


def get_streets():
    df_streets_raw = gpd.read_file(filename_routes).to_crs(crs)

    renamer = {
        'ft_facilit': 'ft',
        'tf_facilit': 'tf'
    }

    df_streets = df_streets_raw.rename(columns=renamer)


    # Fill the lanes with the values from lanes_dict_inv
    # Any value not in that dict will be coded as 0
    for c in cols_lanes:
        col = df_streets[c].copy()
        col = [lanes_dict_inv.get(v, 0) for v in col]
        df_streets[c + '_int'] = col

        # Any value from the initial column that is not in the lanes_dict_inv will be coded as 0
        
    df_streets['lane_max'] = df_streets[[c + '_int' for c in cols_lanes]].apply('max', axis=1)
    df_streets['lane_max'] = df_streets['lane_max'].replace(lanes_dict)

    df_streets['length_km'] = df_streets.geometry.length / 1000
    df_streets['length_miles'] = df_streets.length_km * 0.621371
    df_streets['borough'] = df_streets.boro.astype(int).replace({v:k for k,v in nyc_boros.items()})

    return df_streets


def format_float(f):
    return '{:.3f}'.format(f)

def get_save_location(sequence_id, image_id, folder_name=folder_name):
    return(f"{folder_name}/{sequence_id}____{image_id}.jpg")

def download_and_save_image(sequence_id, image_id, overwrite=False):

    header = {'Authorization' : 'OAuth {}'.format(access_token_mapillary)}
    
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)

    # save each image with ID as filename to directory by sequence ID
    output_name = get_save_location(sequence_id, image_id)
    if os.path.exists(output_name) and not overwrite:
        return((0, output_name))

    url = f"https://graph.mapillary.com/{image_id}?fields=thumb_2048_url"
    r = requests.get(url, headers=header)
    data = r.json()
    #if 'Unsupported get request' in data.get('error', {}).get('message', ''):
    #    return ((0, output_name))
    
    image_url = data['thumb_2048_url']
    with open(output_name, 'wb') as handler:
        image_data = requests.get(image_url, stream=True).content
        handler.write(image_data)
    return((1, output_name))



def bike_route_features():
    data = json.load(open(filename_routes))
    return data['features']

def get_point(coordinates_point):
    (x,y) = coordinates_point
    return shapely.Point(x, y)

def feature_to_data(feature):
    cols_useful = ['bikedir', 'fromstreet', 'tostreet', 'street', 'lanecount', 'facilitycl', 'tf_facilit', 'allclasses', 'onoffst',
                   'ft_facilit', 'boro', 'segmentid', 'bikedir']
    
    properties_feature = feature['properties']
    properties = {k: properties_feature[k] for k in cols_useful}
    coordinates = feature['geometry']['coordinates'][0]
    properties['points'] = [get_point(c) for c in coordinates]
    return properties

def get_points(features):
    df_streets = pd.DataFrame([feature_to_data(f) for f in features])
    df_streets = df_streets[df_streets.boro == str(BORO_MANHATTAN)]
    df_streets.segmentid = df_streets.segmentid.astype(int)
    df_streets['facilit'] = df_streets.tf.fillna(df_streets.ft)
    df_points = df_streets.explode('points')
    df_points['point_lag'] = df_points.groupby('segmentid').points.shift(1)
    ix_missing = df_points[['point_lag', 'points']].isnull().sum(axis=1)
    df_points = df_points[ix_missing==0].copy()
    df_points['rownum'] = np.arange(len(df_points))
    def get_point_for_vals(row):
        return shapely.box(*list(row.point_lag.bounds[0:2]) + list(row.points.bounds[0:2]))
    df_points['box'] = df_points.apply(get_point_for_vals, axis=1)
    df_points['area'] = df_points.box.apply(lambda b: b.area)
    df_points['line_angle'] = df_points.apply(lambda r: get_degrees(r.point_lag, r.points), axis=1)
    df_points['segment_num'] = df_points.groupby('segmentid').cumcount() + 1
    return((df_streets, df_points))


def get_rectangle(point0, point1):
    points_x = point0[1], point1[1]
    points_y = point0[0], point1[0]
    min_lat = min(*points_y)
    max_lat = max(*points_y)
    min_long = min(*points_x)
    max_long = max(*points_x)

    west, south, east, north = [min_long, min_lat, max_long, max_lat]
    return (west, south, east, north)

def get_tiles(point_start, point_end):
    coords0 = invert_list(list(point_start.coords[0]))
    coords1 = invert_list(list(point_end.coords[0]))

    west_start, south_start, east_start, north_start = get_rectangle(coords0, coords1)
    return list(mercantile.tiles(west_start, south_start, east_start, north_start, [14]))

tile_coverage = 'mly1_public'
tile_layer = "image"

def tile_str(tile):
    return f"{tile.z}_{tile.x}_{tile.y}"

def get_filename_for_tile(tile):
    return f'data/images_by_tile/images_{tile_str(tile)}.geojson'

def get_data_for_tile(tile):
    tile_url = f"https://tiles.mapillary.com/maps/vtp/{tile_coverage}/2/{tile.z}/{tile.x}/{tile.y}?access_token={access_token_mapillary}"
    response = requests.get(tile_url)
    data = vt_bytes_to_geojson(response.content, tile.x, tile.y, tile.z,layer=tile_layer)
    return data

def save_tiles(tiles, overwrite=False):

    num_tiles_saved = 0
    for i, tile in enumerate(tiles):
        # If the tile exists and overwrite=False, don't do anything
        if os.path.exists(get_filename_for_tile(tile)) and not overwrite:
            continue

        data = get_data_for_tile(tile)
        with open(get_filename_for_tile(tile), 'w') as f:
            json.dump(data, f)
        num_tiles_saved += 1
    return len(tiles), num_tiles_saved

def load_features_for_tiles(tiles):
    datas = []
    for tile in tiles:
        df_tile = gpd.read_file(get_filename_for_tile(tile))
        datas.append(df_tile)
    df = pd.concat(datas)
    gdf = gpd.GeoDataFrame(df)
    gdf.crs = crs_geo
    gdf.to_crs(crs, inplace=True)
    return(gdf)

def load_all_images(ids_to_keep):
    # All tile_files are the files in the data/images_by_tile folder
    folder_tile = 'data/images_by_tile'
    tile_files = os.listdir(folder_tile)
    datas = []
    for i, tile_file in enumerate(tile_files):
        try:
            df_tile = gpd.read_file(folder_tile + '/' + tile_file)
            df_tile_sel = df_tile[df_tile.id.isin(ids_to_keep)].copy()
            datas.append(df_tile_sel)
            print(i, tile_file, len(df_tile), len(df_tile_sel))

            #if len(df_tile_sel)>0:
            #    break
        except:
            print(i, tile_file, 'error')

        #if len(df_tile_sel)>0:
            # break
    df = pd.concat(datas)
    gdf = gpd.GeoDataFrame(df)
    gdf.crs = crs_geo
    gdf.to_crs(crs, inplace=True)
    return(clean_images(gdf))

def get_reviewed():

    with open('data/ids_reviewed.txt', 'r') as f:
        ids_reviewed = f.read().replace(' ', '\n').split('\n')

    ids_reviewed = [int(i) for i in ids_reviewed if i != '']
    return ids_reviewed

def clean_images(df_images):
    df_images['time'] = pd.to_datetime(df_images.captured_at, unit='ms')
    df_images['ds'] = df_images.time.apply(lambda t: t.strftime('%Y-%m-%d'))
    df_images['image_num'] = np.arange(len(df_images))
    df_images['id_short'] = df_images.id.astype(str).str[-5:]
    df_images['point_google'] = df_images.geometry.to_crs(crs_geo).apply(point_google)
    df_images['id'] = df_images.id.astype(int)
    df_images['is_pano'] = df_images.is_pano.astype('bool')

    df_coded = pd.read_csv('data/bike_coding_sheet_download.csv')
    ids_spreadsheet = list(df_coded.id)
    ids_reviewed = get_reviewed()
    ids_seen = ids_spreadsheet + ids_reviewed
    df_images['is_coded'] = df_images.id.isin(ids_seen)
    
    return df_images


def load_images(tiles):
    df_images = load_features_for_tiles(tiles).to_crs(crs)
    return(clean_images(df_images))


def clean_image_feature(image_feature):
    x,y = image_feature['geometry']['coordinates']
    properties = image_feature['properties']
    angle = properties['compass_angle']
    id = properties['id']
    sequence_id = properties['sequence_id']

    cleaned = {
        'position': shapely.Point(x, y), 
        'angle': angle,
        'id': id,
        'sequence_id': sequence_id,
        'time_unix': properties['captured_at'],
    }

    return(cleaned)

def get_images_from_features(features):
    features_cleaned = [clean_image_feature(f) for f in features]
    return get_images(features_cleaned)

def get_image(sequence_id, image_id):
    """Load the image from the images folder"""
    filename = get_save_location(sequence_id, image_id)
    # Create image from filename
    return Image.open(filename)

def point_google(p):
    x,y=p.coords[0]
    return('https://www.google.com/maps/search/?api=1&query=' + f'{y},{x}')

def get_images(features_cleaned):
    df_images = pd.DataFrame(features_cleaned)
    df_images['time'] = pd.to_datetime(df_images.time_unix, unit='ms')
    df_images['ds'] = df_images.time.apply(lambda t: t.strftime('%Y-%m-%d'))
    df_images['x'] = df_images.position.apply(lambda p: p.x)
    df_images['y'] = df_images.position.apply(lambda p: p.y)
    df_images['image_num'] = np.arange(len(df_images))
    df_images['point_google'] = df_images.position.apply(point_google)
    return(df_images)

def get_line_results(segment_start, segment_end, point):
    line_segment = shapely.LineString([segment_start, segment_end])
    distance = line_segment.distance(point)
    distance_start = segment_start.distance(point)
    distance_end = segment_end.distance(point)

    share_completed = distance_start / (distance_start + distance_end)
    return {'distance': distance, 
            'distance_start': distance_start,
            'distance_end': distance_end,
            'share_completed': share_completed}

def get_neighbors(df_points, df_images):
    results_all = []
    for i, row in df_points.iterrows():
        (segment_start, segment_end) = row.points, row.point_lag
        for j, image_loc in df_images.iterrows():
            results = get_line_results(segment_start, segment_end, image_loc.position)
            results['rownum'] = row.rownum
            results['image_num'] = image_loc.image_num
            results['imagepos'] = image_loc.position
            results['segment_num'] = row.segment_num
            results['image_id'] = image_loc.id
            results['segmentid'] = row.segmentid
            results_all.append(results)

    df_results = pd.DataFrame(results_all).sort_values(['rownum', 'distance'])
    df_results['num_per_row'] = df_results.groupby('rownum').cumcount() + 1
    df_results['lowest_distance'] = df_results.groupby('rownum').distance.transform('min')
    return(df_results.query('distance <= @distance_max').sort_values(['rownum', 'share_completed']))

def restrict_points_to_xy(df_points, box_rect):
    in_rect = df_points.box.apply(lambda b: b.intersection(box_rect).area > 0)
    return df_points[in_rect]

def restrict_images_to_xy(df_images, box_rect):
    in_rect = df_images.position.apply(lambda p: box_rect.contains(p))
    return df_images[in_rect]

def get_neighbors_df(df_points, df_images, box_start, cutoff_size=1000, verbose=True):
    
    dfs = []
    splits = 2
    splits_range = range(splits)

    df_points_rect = restrict_points_to_xy(df_points, box_start)
    df_images_rect = restrict_images_to_xy(df_images, box_start)
    (size_points, size_images) = len(df_points_rect), len(df_images_rect)
    if verbose:
        pos_string = str([f'{m:.3f}' for m in box_start.bounds])
        sizes_string = f'{size_points:05d}, {size_images:05d}, Cutoff: {cutoff_size:05d}'
        print(pos_string + " | " + sizes_string)

    if size_images > cutoff_size:
        west_start, south_start, east_start, north_start = box_start.bounds
        for i in splits_range:
            west = west_start + (east_start - west_start) * i / splits
            east = west_start + (east_start - west_start) * (i+1) / splits
            for j in splits_range:
                south = south_start + (north_start - south_start) * j / splits
                north = south_start + (north_start - south_start) * (j+1) / splits

                box_rect = shapely.box(west, south, east, north)
                df_points_rect = restrict_points_to_xy(df_points, box_rect)
                df_images_rect = restrict_images_to_xy(df_images, box_rect)
                if len(df_points_rect) == 0 or len(df_images_rect) == 0:
                    continue
                try:
                    dfs_neighbor = get_neighbors_df(df_points_rect, df_images_rect, box_rect, cutoff_size, verbose)
                    dfs.extend(dfs_neighbor)
                except TypeError as e:
                    pass
                except ValueError as e:
                    pass
                
    else:
        df_neighbor = get_neighbors(df_points_rect, df_images_rect)
        dfs.append(df_neighbor)
        if verbose:
            print(f"Found {len(df_neighbor)} matches")

    dfs_good = [df for df in dfs if df is not None and len(df) > 0]
    if len(dfs_good) > 0:
        return(dfs_good)
    else: 
        pass

def get_points_from_tuple(t):
    (a,b) = t
    return shapely.box(*list(a.bounds[0:2]) + list(b.bounds[0:2]))

def get_degrees(p0, p1):
    # North:
    (x, y) = (0, 1)
    ang1 = np.arctan2(y, x)

    (x0, y0) = p0.coords[0]
    (x1, y1) = p1.coords[0]
    dx, dy = x1-x0, y1-y0
    ang2 = np.arctan2(dy, dx)
    return np.rad2deg((ang1 - ang2) % (2 * np.pi))


def point_str(point: shapely.Point):
    x, y = point.coords[0]
    return f"{x:.4f}, {y:.4f}"

def store_geojson(df, point_var, filename='data/image_locations.json', properties=['label']):
    df['image_x'] = df[point_var].apply(lambda p: p.x)
    df['image_y'] = df[point_var].apply(lambda p: p.y)    

    points = df_to_geojson(df[['image_x', 'image_y'] + properties], lat='image_y', lon='image_x', precision=6)
    with open(filename, 'w') as f:
        json.dump(points, f)

def get_points(multiline):
    points = []
    for line in multiline.geoms:
        for coords in line.coords:
            point = shapely.Point(coords)
            points.append(point)
    return points

points = {
    'teaneck': [40.892, -74.011], 
    'pennstation': [40.75101209724046, -73.99125691970993],
    'intrepid': [40.76485207306847, -73.99977561562771],
    'centralparkzoo': [40.76997936539738, -73.97268530446279],
    'piercafe71st': [40.78015152241618, -73.99033423997616],
    'washheights': [40.84181731341396, -73.9429127845646],
    'stuytown': [40.73264103351521, -73.97818919807831],
    'northbergen': [40.80500957606999, -74.0027854398595],
    'hoboken': [40.743, -74.032],
    'governorsisland': [40.689, -74.016],
    'williamsburgbridge': [40.713, -73.985],
    'inwood': [40.869, -73.921], 
    'randallsisland': [40.793, -73.921],
    'bushwick': [40.694, -73.921],
    'laguardia': [40.776, -73.873],
    'cedarhurst': [40.625, -73.726], # South-east end of Queens,
    'columbiauniversity': [40.807, -73.962], # North-west end of Queens,
    'fdrdrive': [40.73838760792742, -73.97405568542538],
    'rockawaybeach': [40.58500112010576, -73.81564558933164],
    'woodmere': [40.63169794929388, -73.71429277814309],
    'greatneck': [40.80092896991609, -73.72961519748517],
    'Northern_Tip': (40.879278, -73.916159),
    'Northeast_Corner': (40.803889, -73.933609),
    'Southeast_Corner': (40.700292, -74.016869),
    'Southwest_Corner': (40.736424, -74.020279),
    'Northwest_Corner': (40.851700, -73.952323),
    'Northern_Tip_Return': (40.879278, -73.916159)
}
points_shapely = {k: shapely.Point((x,y)) for (k, (y,x)) in points.items()}


nyc_borough_coordinates = {
    'Manhattan': {
        'Northern_Tip': (40.879278, -73.916159),
        'Northeast_Corner': (40.803889, -73.933609),
        'Southeast_Corner': (40.700292, -74.016869),
        'Southwest_Corner': (40.736424, -74.020279),
        'Northwest_Corner': (40.851700, -73.952323)
    },
    'Brooklyn': {
        'Northwest_Tip': (40.700291, -73.995795),
        'Northeast_Tip': (40.739446, -73.885950),
        'Southeast_Corner': (40.582087, -73.888804),
        'Southwest_Corner': (40.573292, -74.041878)
    },
    'Queens': {
        'Northwest_Tip': (40.800760, -73.930262),
        'Northeast_Tip': (40.802147, -73.700272),
        'Southeast_Corner': (40.582087, -73.700272),
        'Southwest_Corner': (40.571422, -73.835202)
    },
    'Bronx': {
        'Northwest_Tip': (40.912414, -73.907664),
        'Northeast_Tip': (40.910371, -73.780678),
        'Southeast_Corner': (40.800761, -73.826202),
        'Southwest_Corner': (40.817093, -73.931641)
    },
    'Staten_Island': {
        'North_Tip': (40.648169, -74.072642),
        'Northeast_Tip': (40.639439, -74.034243),
        'East_Corner': (40.502145, -74.041878),
        'South_Tip': (40.499180, -74.250481),
        'West_Corner': (40.566422, -74.255641),
        'Northwest_Tip': (40.638169, -74.171642)
    }
}

nyc_borough_coordinates_shapely = {k: {k2: shapely.Point((x,y)) for (k2, (y,x)) in v.items()} for (k, v) in nyc_borough_coordinates.items()}

def outline_from_points(points):
    coords = [list(p.coords[0]) for p in points]
    return shapely.geometry.Polygon(coords)

outlines = {}
for (borough, points) in nyc_borough_coordinates_shapely.items():
    outline = outline_from_points(points.values())
    outline = gpd.GeoSeries([outline], crs=crs_geo).to_crs(crs).iloc[0]
    outlines[borough] = outline

geod = Geod(ellps="WGS84")
point_start = points_shapely['intrepid']
point_end = points_shapely['stuytown']
line_string = LineString([point_start, point_end])
geod = Geod(ellps="WGS84")
dist = point_start.distance(point_end)
dist_m = geod.geometry_length(line_string)

dist_to_dist_meters = dist_m / dist

def split_points(point_start, point_end, max_dist_meters):
    """Whenever the distance exceeds the max_dist, create equidistance points in between that are max_dist apart"""
    points = [point_start, point_end]
    ls = LineString(points)
    dist_meters = point_start.distance(point_end)
    if dist_meters < max_dist_meters:
        return(points)
    else:
        num = int(dist_meters / max_dist_meters)
        for i in range(1, num):
            point = ls.interpolate(i/num, normalized=True)
            points.append(point)
    return list(set(points))
    
def get_split_points(multiline, max_dist_meters):
    points = get_points(multiline)
    points_split = []
    for i in range(len(points)-1):
        point_start = points[i]
        point_end = points[i+1]
        ls = LineString([point_start.coords[0], point_end.coords[0]])
        points_split += [(ls, p) for p in split_points(point_start, point_end, max_dist_meters)]
    return points_split

def get_line_points(ls):
    coords = list(ls.coords)
    return(Point(*coords[0]), Point(*coords[1]))

def get_degree_line(ls):
    return get_degrees(*get_line_points(ls))

def explode_points(df, max_dist_meters):
    df['point_tuple'] = df.geometry.apply(lambda g: get_split_points(g, max_dist_meters))
    # Extract the first element of the tuple into the linesegment column
    df['linesegment'] = df.point_tuple.apply(lambda t: t[0][0])
    df['linesegment_str'] = df.linesegment.apply(lambda ls: str(ls))
    # return(df)
    df['line_angle'] = df.linesegment.apply(get_degree_line)

    # Extract the second element of the tuple into the point column
    df['point'] = df.point_tuple.apply(lambda t: [v[1] for v in t])
    df_points = df.explode('point')
    df_points.point = gpd.GeoSeries(df_points.point, crs=crs)
    df_points.set_geometry('point', inplace=True)
    df_points['num_point'] = range(len(df_points))
    df_points['point_lag'] = df_points.groupby('segmentid').point.shift(1)

    def get_ls(p1, p2):
        # print((p1, p2))
        if p1 != None and p2 != None:
            return shapely.geometry.LineString([p1, p2])
        if p1 == None:
            return shapely.geometry.LineString([p2, p2])
        if p2 == None:
            return shapely.geometry.LineString([p1, p1])

    df_points['line_string'] = [get_ls(p1,p2) for p1, p2 in zip(df_points.point_lag, df_points.point)]
    df_points.line_string = gpd.GeoSeries(df_points.line_string, crs=crs)

    return df_points

def invert_list(a):
    return [a[1], a[0]]

def merge_multiple(df_streets, df_images, buffer_meters):
    df_images_temp = df_images.copy()
    df_images_temp['point_image'] = df_images_temp.geometry
    df_images_temp['geometry'] = df_images_temp.buffer(buffer_meters)
    merged_full = df_streets.sjoin(df_images_temp, predicate='within')
    merged_full['distance_raw'] = [p.distance(i) for (p,i) in zip(merged_full.point, merged_full.point_image)]
    merged_full = merged_full.sort_values(['num_point', 'distance_raw'], ascending=[True, True])
    merged_full['rank'] = merged_full.groupby('num_point').transform('cumcount') + 1
    merged_full['distance_meters'] = merged_full.distance_raw

    # warnings.filterwarnings('default')
    return(merged_full)

cols_export_code = [
    'id_image',
    'num',
    'fromstreet',
    'tostreet',
    'street',
    'bikedir',
    'tf',
    'ft',
    'ds']

nyc_boros = {
    'Manhattan': 1,
    'Brooklyn': 3,
    'Queens': 4,
    'Bronx': 2,
    'Staten_Island': 5
}

def get_df_coded():
    df_coded = pd.read_csv('data/bike_coding_sheet_download.csv')
    df_coded = df_coded[df_coded.id.notnull()].copy()
    df_coded.id = df_coded.id.astype(int)
    df_coded.columns = [c.replace(' ', '_').replace('?', '') for c in df_coded.columns]

    cols_protected = ['through_parking', 'plastic_stoppers', 'white_separation', 'stone']
    obstructions = ['construction', 'cars_standing', 'cars_moving', 'humans']
    cols_lanes = ['sharrow', 'bike_lane', 'parkway']
    cols = obstructions + cols_protected + obstructions + ['useful'] + cols_lanes

    bad_vals = ['?', '´']
    # Remove bad_vals for all cols in double loop
    for c in cols:
        for bad_val in bad_vals:
            df_coded[c] = df_coded[c].astype(str).str.replace(bad_val, '0')

    for c in cols:
        df_coded[c] = df_coded[c].fillna('0').astype(float).fillna(0).astype(int).astype(bool)

    ids_useful = list(df_coded.query('useful').id.unique())

    df_coded['neither'] = ~df_coded[cols_protected].apply(max, axis=1).astype(bool)

    lanes_dict = {
        0: 'None',
        1: 'Sharrows',
        2: 'Standard',
        3: 'Protected Path',
        4: 'Greenway'
    }

    # Invert the dictionary
    lanes_dict_inv = {v:k for k,v in lanes_dict.items()}
    cols_lanes = ['tf_facilit', 'ft_facilit']

    # Fill the lanes with the values from lanes_dict_inv
    # Any value not in that dict will be coded as 0
    for c in cols_lanes:
        col = df_coded[c].copy()
        col = [lanes_dict_inv.get(v, 0) for v in col]
        df_coded[c + '_int'] = col

        # Any value from the initial column that is not in the lanes_dict_inv will be coded as 0
        
    df_coded['lane_max'] = df_coded[[c + '_int' for c in cols_lanes]].apply('max', axis=1)
    df_coded['lane_max'] = df_coded['lane_max'].replace(lanes_dict)
    
    return df_coded