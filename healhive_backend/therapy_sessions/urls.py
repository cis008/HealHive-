from django.urls import path
from .views import SessionListView, BookSessionView, JoinSessionView

urlpatterns = [
    path('', SessionListView.as_view(), name='session-list'),
    path('book', BookSessionView.as_view(), name='book-session'),
    path('<int:session_id>/join', JoinSessionView.as_view(), name='join-session'),
]
