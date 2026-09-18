import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-board-moderator',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './board-moderator.component.html',
  styleUrl: './board-moderator.component.css'
})
export class BoardModeratorComponent implements OnInit {
  public content?: string;

  constructor(private userService: UserService) { }
  
    ngOnInit(): void {
      this.userService.getModeratorBoard().subscribe({
        next: data => {
          this.content = data;
        },
        error: err => {
          if (err.error) {
            try {
              const res = JSON.parse(err.error);
              this.content = res.message;
            } catch {
              this.content = `Error with status: ${err.status} - ${err.statusText}`;
            }
          } else {
            this.content = `Error with status: ${err.status}`;
          }
        }
      });
    }
}
