from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.manifold import TSNE

def get_pca(n_components=2, random_state=42):
    return PCA(n_components=n_components, random_state=random_state)

def get_tsne(n_components=2, perplexity=30.0, learning_rate='auto', random_state=42):
    return TSNE(n_components=n_components, perplexity=perplexity, learning_rate=learning_rate, random_state=random_state)

def get_truncated_svd(n_components=2, random_state=42):
    return TruncatedSVD(n_components=n_components, random_state=random_state)
