
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';

interface TrendingPost {
  author: string;
  title: string;
  url: string;
  isFavorite: boolean;
}

@Component({
  selector: 'app-reddit',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './reddit.html',
  styleUrls: ['./reddit.css']
})
export class Reddit implements OnInit {
  private allPosts: TrendingPost[] = [
    {
      author: "BeduinZPouste",
      title: "They ceremonialy opened a letter with 'last words...' ",
      url: "https://reddit.com/r/mildlyinfuriating/comments/1nkz4vj/they_ceremonialy_opened_a_letter_with_last_words/",
      isFavorite: false
    },
    {
      author: "SomeDude",
      title: "How to fix a leaky faucet in 5 minutes",
      url: "https://reddit.com/r/DIY/comments/1nky4vj/how_to_fix_a_leaky_faucet_in_5_minutes/",
      isFavorite: false
    },
    {
      author: "TechGeek",
      title: "The new iPhone 17 is a game changer",
      url: "https://reddit.com/r/technology/comments/1nka4vj/the_new_iphone_17_is_a_game_changer/",
      isFavorite: false
    },
    {
      author: "FoodieFan",
      title: "The best recipe for homemade pizza",
      url: "https://reddit.com/r/food/comments/1nkc4vj/the_best_recipe_for_homemade_pizza/",
      isFavorite: false
    }
  ];

  filteredPosts: TrendingPost[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  selectedPost: TrendingPost | null = null;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.allPosts.forEach(post => {
      post.isFavorite = this.favoriteService.isFavorite(post.url);
    });
    this.filteredPosts = this.allPosts;
  }

  filterPosts(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredPosts = this.allPosts;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredPosts = this.allPosts.filter(post =>
        post.title.toLowerCase().includes(searchTermLower) ||
        post.author.toLowerCase().includes(searchTermLower)
      );
    }
  }

  openModal(post: TrendingPost): void {
    this.selectedPost = post;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPost = null;
  }

  toggleFavorite(post: TrendingPost): void {
    const id = post.url;
    if (this.favoriteService.isFavorite(id)) {
      this.favoriteService.removeFavorite(id);
    } else {
      const favoriteItem: FavoriteItem = {
        id: id,
        type: 'reddit',
        data: post
      };
      this.favoriteService.addFavorite(favoriteItem);
    }
    post.isFavorite = this.favoriteService.isFavorite(id);
  }
}
