from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture

def get_kmeans(n_clusters=3, max_iter=300, random_state=42):
    return KMeans(n_clusters=n_clusters, init='k-means++', max_iter=max_iter, n_init=10, random_state=random_state)

def get_dbscan(eps=0.5, min_samples=5):
    return DBSCAN(eps=eps, min_samples=min_samples)

def get_agglomerative(n_clusters=3, linkage='ward'):
    return AgglomerativeClustering(n_clusters=n_clusters, linkage=linkage)

def get_gmm(n_components=3, covariance_type='full', random_state=42):
    return GaussianMixture(n_components=n_components, covariance_type=covariance_type, random_state=random_state)