import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  /**
   * Observable that emits the current loading state
   */
  public readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Shows the loading indicator
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Hides the loading indicator
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

  /**
   * Sets the loading state to the specified value
   * @param isLoading Whether the loading indicator should be shown
   */
  setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }

  /**
   * Gets the current loading state
   * @returns The current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
