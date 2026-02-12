from flask import Blueprint, request, jsonify, session, current_app


from backend.app.authentication.jwt import token_required

home_bp = Blueprint("home",__name__)

@home_bp.route('/home',methods = ['GET'])
@token_required
def home(token_data):
    return jsonify({
        'message': 'Welcome to the protected route',
        'user': token_data['user']
    })