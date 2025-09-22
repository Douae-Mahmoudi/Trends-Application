import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Historique } from './historique';
import { FavoriteService, FavoriteItem } from '../services/favorite.service';

describe('Historique', () => {
  let component: Historique;
  let fixture: ComponentFixture<Historique>;
  let favoriteService: FavoriteService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historique],
      providers: [FavoriteService]
    }).compileComponents();

    fixture = TestBed.createComponent(Historique);
    component = fixture.componentInstance;
    favoriteService = TestBed.inject(FavoriteService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter items based on searchTerm', () => {
    component.allItems = [
      { id: '1', type: 'github', title: 'Angular', url: '#', isFavorite: false },
      { id: '2', type: 'reddit', title: 'React', url: '#', isFavorite: false },
      { id: '3', type: 'news', title: 'Vue', url: '#', isFavorite: false },
      { id: '4', type: 'sports', title: 'Football', url: '#', isFavorite: false }
    ];

    component.searchTerm = 'React';
    component.filterItems();
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].title).toBe('React');

    component.searchTerm = 'Vue';
    component.filterItems();
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].title).toBe('Vue');

    component.searchTerm = '';
    component.filterItems();
    expect(component.filteredItems.length).toBe(4);
  });

  it('should toggle favorite status', () => {
    const item: FavoriteItem = { id: '1', type: 'github', title: 'Angular', url: '#', isFavorite: false };
    component.allItems = [item];

    // Ajout dans les favoris
    component.toggleFavorite(item);
    expect(item.isFavorite).toBeTrue();
    expect(favoriteService.isFavorite(item.id)).toBeTrue();

    // Retrait des favoris
    component.toggleFavorite(item);
    expect(item.isFavorite).toBeFalse();
    expect(favoriteService.isFavorite(item.id)).toBeFalse();
  });
});
